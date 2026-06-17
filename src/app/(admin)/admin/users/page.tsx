import type { Metadata } from "next";
import { adminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const { data: users } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>
      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Type</th>
              <th className="text-right px-4 py-3 font-medium text-foreground">Credits</th>
              <th className="text-right px-4 py-3 font-medium text-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 text-foreground">{user.email}</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">
                  {user.user_type ?? "homeowner"}
                </td>
                <td className="px-4 py-3 text-right text-foreground">
                  {user.credits_balance}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatDate(user.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
