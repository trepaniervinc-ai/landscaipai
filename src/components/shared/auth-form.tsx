"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  function redirectToDashboard() {
    router.refresh();
    router.push("/dashboard");
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShowSuccess(false);
    setUnconfirmed(false);
    setResent(false);
    setLoading(true);

    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: fullName ? { full_name: fullName } : undefined,
          },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          redirectToDashboard();
        } else {
          setShowSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(error.message);
          if (error.code === "email_not_confirmed") setUnconfirmed(true);
          return;
        }
        redirectToDashboard();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (!error) setResent(true);
    setResending(false);
  }

  const inputClass =
    "w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        type="button"
        className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? <Spinner /> : <GoogleIcon />}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
              className={inputClass}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            {mode === "login" && (
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive space-y-1.5">
            <p>{error}</p>
            {mode === "login" && unconfirmed && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending || resent}
                className="text-sm font-medium text-destructive underline hover:no-underline disabled:opacity-60"
              >
                {resent
                  ? "Verification email sent."
                  : resending
                    ? "Sending…"
                    : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        {showSuccess && (
          <div className="rounded-md border border-primary/20 bg-accent px-3 py-2.5 text-sm text-accent-foreground">
            Check your email to confirm your account, then sign in.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Spinner />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      {/* Toggle link */}
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
