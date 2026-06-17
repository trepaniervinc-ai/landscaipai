import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Gallery</h1>
      <p className="text-muted-foreground mb-10">
        Landscaping transformations created with Landscaip.
      </p>
      {/* Gallery grid — populated from gallery_items table */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted rounded-lg border border-border animate-pulse"
          />
        ))}
      </div>
    </main>
  );
}
