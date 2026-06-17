import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  return p?.user_type === "admin" ? user : null;
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { key, value } = await request.json();
  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("admin_settings")
    .update({ value: String(value), updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ setting: data });
}
