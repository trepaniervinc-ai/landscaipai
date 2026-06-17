import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 prose prose-sm">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Terms of Service
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Last updated: June 2026
      </p>
      <div className="space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="font-semibold text-base mb-2">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By using Landscaip, you agree to these terms. If you do not agree,
            do not use the service.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-2">2. Credits & Billing</h2>
          <p className="text-muted-foreground">
            Credits are consumed for AI operations. Subscription credits reset
            monthly. One-time packs do not expire. Refunds are issued for failed
            AI operations only.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-2">3. Acceptable Use</h2>
          <p className="text-muted-foreground">
            You may not use Landscaip to generate content that violates
            applicable laws or Gemini&apos;s content policies.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-base mb-2">4. Intellectual Property</h2>
          <p className="text-muted-foreground">
            You retain ownership of photos you upload. Generated images are
            licensed to you per your plan (personal or commercial).
          </p>
        </section>
      </div>
    </main>
  );
}
