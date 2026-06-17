import type { Metadata } from "next";
import AuthForm from "@/components/shared/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your Landscaip account
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
