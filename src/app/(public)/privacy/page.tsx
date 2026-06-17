import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-3">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: June 2026</p>
      <div className="space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="font-semibold text-base mb-2">Data We Collect</h2>
          <p className="text-muted-foreground">
            Email address, uploaded photos, generated images, and usage data.
            Payment data is processed by Stripe and never stored on our servers.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-2">How We Use It</h2>
          <p className="text-muted-foreground">
            To provide the service, process payments, and improve the product.
            We do not sell your data.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-2">Data Retention</h2>
          <p className="text-muted-foreground">
            Your data is retained while your account is active. You can request
            deletion at any time from account settings.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-2">Contact</h2>
          <p className="text-muted-foreground">
            For privacy questions, contact us via the{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
