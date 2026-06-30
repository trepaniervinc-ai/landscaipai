import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { LeafIcon } from "@/components/shared/leaf-icon";
import { CreditsBadge } from "@/components/shared/credits-badge";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

export const metadata: Metadata = { title: "Dashboard — Landscaip" };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const profile = await getAuthenticatedProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, updated_at, is_shared")
    .order("updated_at", { ascending: false });

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground mb-0.5">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {firstName}&apos;s projects
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <CreditsBadge credits={profile.credits_balance} className="hidden sm:flex" />
          <Link
            href="/generate"
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New project
          </Link>
        </div>
      </div>

      {/* Content */}
      {!projects?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-5">
            <LeafIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Your first design awaits
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
            Upload a photo of your property and watch AI transform it with professional landscaping styles.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Start your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: Pick<Project, "id" | "name" | "updated_at" | "is_shared">) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                <LeafIcon className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(project.updated_at)}
                  </p>
                  {project.is_shared && (
                    <span className="text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                      Shared
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* New project card */}
          <Link
            href="/generate"
            className="group block border border-dashed border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
          >
            <div className="aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">New project</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
