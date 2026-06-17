import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Shared Project — ${slug}` };
}

export default async function SharedProjectPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, images(*, generations(*))")
    .eq("share_slug", slug)
    .eq("is_shared", true)
    .single();

  if (!project) notFound();

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Shared landscaping project · read-only view
        </p>
      </div>
      {/* Images + generations grid rendered here */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-muted rounded-lg h-64 flex items-center justify-center border border-border">
          <p className="text-muted-foreground text-sm">Project images will appear here</p>
        </div>
      </div>
    </main>
  );
}
