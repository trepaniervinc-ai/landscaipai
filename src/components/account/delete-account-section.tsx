"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DeleteAccountSectionProps {
  currentEmail: string;
}

export default function DeleteAccountSection({ currentEmail }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canDelete = confirmEmail === currentEmail && !loading;

  async function handleDelete() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmEmail }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <section className="bg-card border border-destructive/30 rounded-lg p-6">
      <h2 className="font-semibold text-destructive mb-2">Danger zone</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Deleting your account cancels any active subscription and permanently removes all
        your projects, images, and generations. This cannot be undone.
      </p>

      <label htmlFor="confirmEmail" className="text-sm font-medium text-foreground">
        Type <span className="font-semibold">{currentEmail}</span> to confirm
      </label>
      <input
        id="confirmEmail"
        type="text"
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
        placeholder={currentEmail}
        className="mt-1.5 w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />

      {error && (
        <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={!canDelete}
        className="mt-4 h-9 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Deleting…" : "Delete my account"}
      </button>
    </section>
  );
}
