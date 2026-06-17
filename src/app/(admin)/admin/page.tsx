import type { Metadata } from "next";
import { adminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [{ count: userCount }, { count: generationCount }] = await Promise.all([
    adminClient.from("profiles").select("*", { count: "exact", head: true }),
    adminClient.from("generations").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total users", value: userCount ?? 0 },
    { label: "Total generations", value: generationCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-background border border-border rounded-lg p-5 shadow-sm"
          >
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="font-semibold text-foreground mb-4">
          Revenue chart (Recharts placeholder)
        </h2>
        <div className="h-48 bg-muted rounded-md flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Chart renders here</p>
        </div>
      </div>
    </div>
  );
}
