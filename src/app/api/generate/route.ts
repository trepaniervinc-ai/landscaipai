import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { buildPrompt } from "@/lib/gemini/prompts";
import type { GenerateRequest } from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateRequest = await request.json();
  const { image_id, style_preset, time_of_day, season, weather, custom_prompt } =
    body;

  if (!image_id) {
    return NextResponse.json({ error: "image_id is required" }, { status: 400 });
  }

  // Fetch image record and verify ownership
  const { data: image, error: imageError } = await supabase
    .from("images")
    .select("*")
    .eq("id", image_id)
    .eq("user_id", user.id)
    .single();

  if (imageError || !image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Create generation row in pending state
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      image_id,
      user_id: user.id,
      status: "pending",
      style_preset: style_preset ?? null,
      time_of_day: time_of_day ?? null,
      season: season ?? null,
      weather: weather ?? null,
      custom_prompt: custom_prompt ?? null,
      is_inpainting: false,
    })
    .select()
    .single();

  if (genError || !generation) {
    return NextResponse.json({ error: "Failed to create generation" }, { status: 500 });
  }

  // Deduct credit atomically before calling AI
  const { data: deductResult, error: deductError } = await supabase.rpc(
    "deduct_credit",
    { p_user_id: user.id, p_generation_id: generation.id }
  );

  if (deductError || !deductResult?.success) {
    await supabase
      .from("generations")
      .update({ status: "failed", error_message: "insufficient_credits" })
      .eq("id", generation.id);
    return NextResponse.json(
      { error: deductResult?.reason ?? "Insufficient credits" },
      { status: 402 }
    );
  }

  // Update status to processing
  await supabase
    .from("generations")
    .update({ status: "processing" })
    .eq("id", generation.id);

  try {
    // Fetch source image from storage
    const { data: imageData } = await supabase.storage
      .from("landscaip-uploads")
      .download(image.storage_path);

    if (!imageData) throw new Error("Failed to fetch image from storage");

    const arrayBuffer = await imageData.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const prompt = buildPrompt({
      stylePreset: style_preset as Parameters<typeof buildPrompt>[0]["stylePreset"],
      timeOfDay: time_of_day,
      season,
      weather,
      customPrompt: custom_prompt,
    });

    // Update generation with the final prompt
    await supabase
      .from("generations")
      .update({ full_prompt: prompt })
      .eq("id", generation.id);

    // Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image" });

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: image.mime_type ?? "image/jpeg" } },
      { text: prompt },
    ]);

    const generatedImageData = result.response
      .candidates?.[0]
      ?.content?.parts?.find((p) => p.inlineData)?.inlineData;

    if (!generatedImageData) throw new Error("No image in Gemini response");

    // Store generated image
    const storagePath = `${user.id}/${image.project_id}/${generation.id}.webp`;
    const imageBuffer = Buffer.from(generatedImageData.data, "base64");

    const { error: uploadError } = await supabase.storage
      .from("landscaip-generations")
      .upload(storagePath, imageBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) throw new Error("Failed to store generated image");

    // Mark as completed
    await supabase
      .from("generations")
      .update({
        status: "completed",
        storage_path: storagePath,
        completed_at: new Date().toISOString(),
      })
      .eq("id", generation.id);

    return NextResponse.json({ generation_id: generation.id, storage_path: storagePath });
  } catch (err) {
    // Refund credit on failure
    await supabase.rpc("refund_credit", {
      p_user_id: user.id,
      p_generation_id: generation.id,
    });
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Generation failed",
      })
      .eq("id", generation.id);

    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
