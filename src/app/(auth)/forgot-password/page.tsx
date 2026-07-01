import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/shared/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password — Landscaip",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
