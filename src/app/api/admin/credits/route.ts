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

  const { user_id, amount, description } = await request.json();
  if (!user_id || !amount) {
    return NextResponse.json({ error: "user_id and amount required" }, { status: 400 });
  }

  const { data, error } = await adminClient.rpc("add_credits", {
    p_user_id: user_id,
    p_amount: amount,
    p_type: "purchase",
    p_description: description ?? "Admin credit adjustment",
  });

  if (error) return NextResponse.json({ error: "Failed to adjust credits" }, { status: 500 });

  return NextResponse.json({ result: data });
}
