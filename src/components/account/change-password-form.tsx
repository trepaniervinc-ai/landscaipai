"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ChangePasswordFormProps {
  hasPassword: boolean;
}

export default function ChangePasswordForm({ hasPassword }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
      ...(hasPassword ? { current_password: currentPassword } : {}),
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {hasPassword ? "Change password" : "Set a password"}
      </h3>
      {!hasPassword && (
        <p className="text-sm text-muted-foreground">
          You signed in with Google. Set a password to also be able to sign in with your email.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {hasPassword && (
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min. 8 characters)"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-primary/20 bg-accent px-3 py-2.5 text-sm text-accent-foreground">
            Password updated.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : hasPassword ? "Update password" : "Set password"}
        </button>
      </form>
    </div>
  );
}
