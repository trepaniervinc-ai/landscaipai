"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface NavbarClientProps {
  profile: Profile | null;
}

export default function NavbarClient({ profile }: NavbarClientProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (profile?.email?.[0]?.toUpperCase() ?? "?");

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href={profile ? "/dashboard" : "/"}
          className="flex items-center gap-2 shrink-0"
        >
          <svg
            className="w-5 h-5 text-primary"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 3 8 3 6 5c-3 3-3 7-3 7 0 0 4-4 14-4z" />
          </svg>
          <span className="font-bold text-foreground tracking-tight">Landscaip</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <Link
            href="/gallery"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            Pricing
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              {/* Credits badge */}
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent/80 transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {profile.credits_balance} {profile.credits_balance === 1 ? "credit" : "credits"}
              </Link>

              {/* Avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center hover:bg-primary/90 transition-colors overflow-hidden"
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-9 h-9 object-cover" />
                  ) : (
                    initials
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-background border border-border rounded-lg shadow-md py-1 z-50">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile.full_name || profile.email}
                      </p>
                      {profile.full_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.email}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Account
                    </Link>
                    {profile.user_type === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-flex px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
              >
                Get started
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <Link
            href="/gallery"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
          >
            Pricing
          </Link>
          {profile ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
              >
                Account · {profile.credits_balance} credits
              </Link>
              {profile.user_type === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => { setMobileOpen(false); handleSignOut(); }}
                className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
