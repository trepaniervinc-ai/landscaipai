import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/supabase/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single();
  return { title: data?.name ?? "Project" };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const profile = await getAuthenticatedProfile();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, images(*, generations(*))")
    .eq("id", id)
    .eq("user_id", profile!.id)
    .single();

  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <div className="flex gap-3">
          <button className="border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors">
            Share
          </button>
          <a
            href="/generate"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + Add image
          </a>
        </div>
      </div>

      {/* Images grid placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        {(project.images ?? []).length === 0 ? (
          <div className="col-span-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground text-sm">
              No images yet. Add a photo to get started.
            </p>
          </div>
        ) : (
          (project.images as { id: string; file_name: string }[]).map((img) => (
            <div key={img.id} className="bg-muted rounded-lg border border-border h-64" />
          ))
        )}
      </div>
    </div>
  );
}
