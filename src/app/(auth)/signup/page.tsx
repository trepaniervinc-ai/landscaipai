import type { Metadata } from "next";
import AuthForm from "@/components/shared/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Start visualizing your landscape
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Free account · 3 credits included · no card required
        </p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
