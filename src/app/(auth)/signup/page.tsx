import type { Metadata } from "next";
import AuthForm from "@/components/shared/auth-form";

export const metadata: Metadata = {
  title: "Create account — Landscaip",
};

export default function SignupPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          3 free credits — no card required
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Start designing today
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create your free account and transform your landscape with AI.
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
