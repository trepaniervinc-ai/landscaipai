import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
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
    .select("*")
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
          <span className="hidden sm:flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {profile.credits_balance} {profile.credits_balance === 1 ? "credit" : "credits"}
          </span>
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
      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-5">
            <svg
              className="w-8 h-8 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 3 8 3 6 5c-3 3-3 7-3 7 0 0 4-4 14-4z" />
            </svg>
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
          {projects.map((project: Project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground/30"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 3 8 3 6 5c-3 3-3 7-3 7 0 0 4-4 14-4z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors truncate">
                  {project.name}
                </h3>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
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
