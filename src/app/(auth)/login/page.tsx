import type { Metadata } from "next";
import AuthForm from "@/components/shared/auth-form";

export const metadata: Metadata = {
  title: "Sign in — Landscaip",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue designing your landscape.
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
