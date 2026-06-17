import type { Metadata } from "next";

export const metadata: Metadata = { title: "Generate" };

export default function GeneratePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Generate landscape design
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload area */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-foreground">1. Upload photo</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-card">
            <p className="text-3xl mb-3">📷</p>
            <p className="text-sm font-medium text-foreground mb-1">
              Drop photo here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              JPG · PNG · WEBP · HEIC · up to 10 MB
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-foreground">2. Choose style</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Style preset
            </label>
            <select className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
              <option value="">None (custom prompt only)</option>
              <option value="japanese-zen">Japanese Zen</option>
              <option value="english-cottage">English Cottage</option>
              <option value="modern-minimalist">Modern Minimalist</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="tropical-paradise">Tropical Paradise</option>
              <option value="drought-tolerant">Drought-Tolerant Xeriscape</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Time of day
              </label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                <option value="">Any</option>
                <option value="golden-hour">Golden hour</option>
                <option value="midday">Midday</option>
                <option value="dusk">Dusk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Season
              </label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                <option value="">Any</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Weather
              </label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                <option value="">Any</option>
                <option value="sunny">Sunny</option>
                <option value="overcast">Overcast</option>
                <option value="partly-cloudy">Partly cloudy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Custom prompt (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add a koi pond near the front path…"
              className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button className="bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors mt-2">
            Generate · 1 credit
          </button>
        </div>
      </div>
    </div>
  );
}
