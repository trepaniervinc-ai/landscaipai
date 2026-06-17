import type { Metadata } from "next";
import { adminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin · Gallery" };

export default async function AdminGalleryPage() {
  const { data: items } = await adminClient
    .from("gallery_items")
    .select("*")
    .order("display_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
          + Add item
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {(items ?? []).map((item) => (
          <div
            key={item.id}
            className="bg-background border border-border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-3">
              <p className="text-sm text-foreground font-medium">
                {item.caption ?? "No caption"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.style_preset ?? "—"} ·{" "}
                {item.is_active ? "Active" : "Hidden"}
              </p>
            </div>
          </div>
        ))}
        {!items?.length && (
          <p className="text-sm text-muted-foreground col-span-3">
            No gallery items yet.
          </p>
        )}
      </div>
    </div>
  );
}
