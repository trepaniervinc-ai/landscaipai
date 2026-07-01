"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutOthersButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "others" });
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Sessions</h3>
      <p className="text-sm text-muted-foreground">
        Sign out everywhere else while staying signed in here.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="h-9 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {done ? "Done" : loading ? "Signing out…" : "Sign out of all other sessions"}
      </button>
    </div>
  );
}
