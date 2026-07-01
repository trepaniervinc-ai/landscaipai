"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ChangeEmailFormProps {
  currentEmail: string;
  pendingEmail: string | null;
}

export default function ChangeEmailForm({ currentEmail, pendingEmail }: ChangeEmailFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/account` }
    );
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setEmail("");
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Change email</h3>
      <p className="text-sm text-muted-foreground">Current: {currentEmail}</p>

      {pendingEmail && (
        <div className="rounded-md border border-primary/20 bg-accent px-3 py-2.5 text-sm text-accent-foreground">
          A confirmation is pending for <strong>{pendingEmail}</strong>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new-email@example.com"
          required
          autoComplete="email"
          className={inputClass}
        />

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-primary/20 bg-accent px-3 py-2.5 text-sm text-accent-foreground">
            Check your inbox to confirm this change — you may receive confirmation
            links at both your current and new address.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : "Update email"}
        </button>
      </form>
    </div>
  );
}
