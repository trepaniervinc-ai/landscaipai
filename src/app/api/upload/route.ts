import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch max upload size from admin settings
  const { data: setting } = await adminClient
    .from("admin_settings")
    .select("value")
    .eq("key", "max_image_upload_size_mb")
    .single();

  const maxSizeMb = Number(setting?.value ?? 10);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!projectId) return NextResponse.json({ error: "project_id required" }, { status: 400 });

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return NextResponse.json(
      { error: `File exceeds ${maxSizeMb} MB limit` },
      { status: 413 }
    );
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const imageId = crypto.randomUUID();
  const storagePath = `uploads/${user.id}/${projectId}/${imageId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("landscaip-uploads")
    .upload(storagePath, arrayBuffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: imageRow, error: dbError } = await supabase
    .from("images")
    .insert({
      id: imageId,
      project_id: projectId,
      user_id: user.id,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: "Failed to save image record" }, { status: 500 });
  }

  return NextResponse.json({ image: imageRow });
}
