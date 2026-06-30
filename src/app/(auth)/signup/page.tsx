import type { Metadata } from "next";
import AuthForm from "@/components/shared/auth-form";
import { StarIcon } from "@/components/shared/star-icon";

export const metadata: Metadata = {
  title: "Create account — Landscaip",
};

export default function SignupPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
          <StarIcon className="w-3 h-3" />
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
