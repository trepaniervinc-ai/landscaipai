import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create project" }, { status: 500 });

  return NextResponse.json({ project }, { status: 201 });
}
