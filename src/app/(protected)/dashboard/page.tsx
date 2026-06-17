import type { Metadata } from "next";
import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await getAuthenticatedProfile();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.credits_balance ?? 0} credits remaining
          </p>
        </div>
        <Link
          href="/generate"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New project
        </Link>
      </div>

      {!projects?.length ? (
        <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
          <p className="text-4xl mb-4">🌿</p>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No projects yet
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Upload a photo and start generating landscaping designs.
          </p>
          <Link
            href="/generate"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create first project
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden" />
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(project.updated_at)}
                {project.is_shared && (
                  <span className="ml-2 text-primary">· shared</span>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
