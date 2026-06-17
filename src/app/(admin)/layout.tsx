import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getAuthenticatedProfile();
  if (!profile || profile.user_type !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className="w-56 bg-background border-r border-border flex flex-col">
        <div className="h-16 border-b border-border flex items-center px-4">
          <Link href="/" className="font-bold text-primary">
            Landscaip
          </Link>
          <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">
            Admin
          </span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link
            href="/admin"
            className="text-sm text-foreground px-3 py-2 rounded-md hover:bg-muted"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="text-sm text-foreground px-3 py-2 rounded-md hover:bg-muted"
          >
            Users
          </Link>
          <Link
            href="/admin/gallery"
            className="text-sm text-foreground px-3 py-2 rounded-md hover:bg-muted"
          >
            Gallery
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm text-foreground px-3 py-2 rounded-md hover:bg-muted"
          >
            Settings
          </Link>
          <div className="mt-auto pt-4 border-t border-border">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground px-3 py-2 rounded-md hover:bg-muted block"
            >
              ← Back to app
            </Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
