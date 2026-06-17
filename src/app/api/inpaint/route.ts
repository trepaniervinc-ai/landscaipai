import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/gemini/prompts";
import type { InpaintRequest } from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: InpaintRequest = await request.json();
  const {
    image_id,
    parent_generation_id,
    mask_description,
    style_preset,
    time_of_day,
    season,
    weather,
    custom_prompt,
  } = body;

  if (!image_id || !parent_generation_id || !mask_description) {
    return NextResponse.json(
      { error: "image_id, parent_generation_id, and mask_description are required" },
      { status: 400 }
    );
  }

  // Fetch image and parent generation, verify ownership
  const [{ data: image }, { data: parentGen }] = await Promise.all([
    supabase.from("images").select("*").eq("id", image_id).eq("user_id", user.id).single(),
    supabase.from("generations").select("*").eq("id", parent_generation_id).eq("user_id", user.id).single(),
  ]);

  if (!image || !parentGen) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // Create in-painting generation row
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      image_id,
      user_id: user.id,
      parent_gen_id: parent_generation_id,
      status: "pending",
      style_preset: style_preset ?? null,
      time_of_day: time_of_day ?? null,
      season: season ?? null,
      weather: weather ?? null,
      custom_prompt: custom_prompt ?? null,
      is_inpainting: true,
    })
    .select()
    .single();

  if (genError || !generation) {
    return NextResponse.json({ error: "Failed to create generation" }, { status: 500 });
  }

  // Deduct credit before calling AI
  const { data: deductResult } = await supabase.rpc("deduct_credit", {
    p_user_id: user.id,
    p_generation_id: generation.id,
  });

  if (!deductResult?.success) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: "insufficient_credits" })
      .eq("id", generation.id);
    return NextResponse.json(
      { error: deductResult?.reason ?? "Insufficient credits" },
      { status: 402 }
    );
  }

  await supabase.from("generations").update({ status: "processing" }).eq("id", generation.id);

  try {
    // Use the parent generation's output image as input, falling back to the original
    const sourcePath = parentGen.storage_path ?? image.storage_path;
    const sourceBucket = parentGen.storage_path ? "landscaip-generations" : "landscaip-uploads";

    const { data: imageData } = await supabase.storage.from(sourceBucket).download(sourcePath);
    if (!imageData) throw new Error("Failed to fetch source image");

    const base64Image = Buffer.from(await imageData.arrayBuffer()).toString("base64");

    const prompt = buildPrompt({
      stylePreset: style_preset as Parameters<typeof buildPrompt>[0]["stylePreset"],
      timeOfDay: time_of_day,
      season,
      weather,
      customPrompt: custom_prompt,
      isInpainting: true,
      maskDescription: mask_description,
    });

    await supabase.from("generations").update({ full_prompt: prompt }).eq("id", generation.id);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image" });

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
      { text: prompt },
    ]);

    const generatedImageData = result.response
      .candidates?.[0]
      ?.content?.parts?.find((p) => p.inlineData)?.inlineData;

    if (!generatedImageData) throw new Error("No image in Gemini response");

    const storagePath = `${user.id}/${image.project_id}/${generation.id}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("landscaip-generations")
      .upload(storagePath, Buffer.from(generatedImageData.data, "base64"), {
        contentType: "image/webp",
      });

    if (uploadError) throw new Error("Failed to store result");

    await supabase
      .from("generations")
      .update({ status: "completed", storage_path: storagePath, completed_at: new Date().toISOString() })
      .eq("id", generation.id);

    return NextResponse.json({ generation_id: generation.id, storage_path: storagePath });
  } catch (err) {
    await supabase.rpc("refund_credit", { p_user_id: user.id, p_generation_id: generation.id });
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: err instanceof Error ? err.message : "Failed" })
      .eq("id", generation.id);
    return NextResponse.json({ error: "Inpainting failed" }, { status: 500 });
  }
}
