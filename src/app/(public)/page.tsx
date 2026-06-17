import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landscaip — AI Landscaping Visualization",
};

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="py-24 px-4 text-center bg-background">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            Transform Your Yard with{" "}
            <span className="text-primary">AI Design</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Upload a photo of your property and get professional landscaping
            designs in seconds. 16 style presets, in-painting, and iterative
            refinement — powered by Gemini AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold text-base hover:bg-primary/90 transition-colors"
            >
              Get started free →
            </Link>
            <Link
              href="/gallery"
              className="border border-border text-foreground px-8 py-3 rounded-md font-semibold text-base hover:bg-muted transition-colors"
            >
              View gallery
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            3 free credits on signup. No credit card required.
          </p>
        </div>
      </section>

      {/* Drop zone placeholder */}
      <section className="py-16 px-4 bg-muted">
        <div className="max-w-2xl mx-auto">
          <div className="border-2 border-dashed border-border rounded-xl p-16 text-center bg-background">
            <p className="text-4xl mb-4">📷</p>
            <p className="text-lg font-medium text-foreground mb-2">
              Drop your photo here
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              JPG, PNG, WEBP, or HEIC · up to 10 MB
            </p>
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Sign up to get started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything you need to visualize the perfect landscape
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "16 Style Presets",
                desc: "From Japanese Zen to English Cottage, Mediterranean to Modern Minimalist.",
              },
              {
                icon: "✏️",
                title: "In-Painting Canvas",
                desc: "Mask specific areas and apply targeted changes without affecting the rest.",
              },
              {
                icon: "🔄",
                title: "Iterative Refinement",
                desc: "Re-prompt, adjust settings, compare results. Always reset to original.",
              },
              {
                icon: "🌤️",
                title: "Environment Controls",
                desc: "Set time of day, season, and weather for realistic renderings.",
              },
              {
                icon: "🔗",
                title: "Shareable Projects",
                desc: "Share a project link with clients for professional presentations.",
              },
              {
                icon: "📱",
                title: "Mobile Camera",
                desc: "Capture photos directly from your phone camera on-site.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-lg p-6 shadow-sm"
              >
                <p className="text-3xl mb-3">{icon}</p>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to reimagine your landscape?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join landscapers and homeowners already using Landscaip.
          </p>
          <Link
            href="/signup"
            className="bg-white text-primary px-8 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors inline-block"
          >
            Start for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-bold text-primary">Landscaip</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/gallery" className="hover:text-foreground">Gallery</Link>
            <Link href="/faq" className="hover:text-foreground">FAQ</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Landscaip
          </p>
        </div>
      </footer>
    </main>
  );
}
