import type { Metadata } from "next";
import { adminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin · Settings" };

export default async function AdminSettingsPage() {
  const { data: settings } = await adminClient
    .from("admin_settings")
    .select("*")
    .order("key");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Platform Settings</h1>
      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-foreground">Key</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Value</th>
              <th className="text-left px-4 py-3 font-medium text-foreground">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(settings ?? []).map((s) => (
              <tr key={s.key} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-foreground">{s.key}</td>
                <td className="px-4 py-3 text-foreground">{s.value}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.description ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-primary hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
