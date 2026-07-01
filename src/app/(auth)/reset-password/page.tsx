import type { Metadata } from "next";
import ResetPasswordForm from "@/components/shared/reset-password-form";

export const metadata: Metadata = {
  title: "Set new password — Landscaip",
};

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Set a new password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
