"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ResendVerificationBannerProps {
  email: string;
}

export default function ResendVerificationBanner({ email }: ResendVerificationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (!error) setSent(true);
  }

  return (
    <div className="rounded-md border border-primary/20 bg-accent px-3 py-2.5 text-sm text-accent-foreground flex items-center justify-between gap-3 mb-6">
      <span>Your email address isn&apos;t verified yet.</span>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || sent}
        className="font-medium underline hover:no-underline disabled:opacity-60 shrink-0"
      >
        {sent ? "Sent" : loading ? "Sending…" : "Resend verification email"}
      </button>
    </div>
  );
}
