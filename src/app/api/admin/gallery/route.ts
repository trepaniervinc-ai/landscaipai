import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  return p?.user_type === "admin" ? user : null;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { generation_id, storage_path, caption, style_preset, display_order } = body;

  const { data, error } = await adminClient
    .from("gallery_items")
    .insert({ generation_id, storage_path, caption, style_preset, display_order: display_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to add item" }, { status: 500 });

  return NextResponse.json({ item: data }, { status: 201 });
}
