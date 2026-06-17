import Link from "next/link";
import type { Metadata } from "next";
import { PLANS, CREDIT_PACKS } from "@/lib/stripe/config";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Start free. Scale as you grow.
        </p>
      </div>

      {/* Subscription plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`bg-card border rounded-xl p-6 shadow-sm ${
              key === "pro" ? "border-primary ring-2 ring-primary" : "border-border"
            }`}
          >
            {key === "pro" && (
              <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full mb-3 inline-block">
                Most popular
              </span>
            )}
            <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
            <p className="text-3xl font-bold text-foreground mt-2">
              ${plan.price}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.credits} credits / month
            </p>
            <ul className="mt-6 space-y-2 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`block text-center py-2.5 rounded-md text-sm font-medium transition-colors ${
                key === "pro"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border hover:bg-muted"
              }`}
            >
              Get started
            </Link>
          </div>
        ))}
      </div>

      {/* Credit packs */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          One-time credit packs
        </h2>
        <p className="text-muted-foreground">No subscription needed.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {Object.entries(CREDIT_PACKS).map(([key, pack]) => (
          <div key={key} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-foreground">{pack.name}</h3>
            <p className="text-2xl font-bold text-foreground mt-1">
              ${pack.price}
            </p>
            <p className="text-sm text-muted-foreground">{pack.credits} credits</p>
            <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
            <Link
              href="/signup"
              className="block mt-4 text-center border border-border py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Buy pack
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">
        All plans include a 3-credit free trial.{" "}
        <Link href="/faq" className="text-primary hover:underline">
          Read the FAQ
        </Link>
      </p>
    </main>
  );
}
