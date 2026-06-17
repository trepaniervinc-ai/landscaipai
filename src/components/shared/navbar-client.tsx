"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";

interface NavbarClientProps {
  profile: Profile | null;
}

export default function NavbarClient({ profile }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary">
          Landscaip
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/gallery"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>

          {profile ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {profile.credits_balance} credits
              </span>
              <Link
                href="/dashboard"
                className="text-sm text-foreground font-medium"
              >
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center"
                >
                  {profile.full_name?.[0]?.toUpperCase() ??
                    profile.email[0]?.toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-md py-1">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Account
                    </Link>
                    {profile.user_type === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-foreground font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get started free
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current mb-1" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          <Link href="/gallery" className="text-sm text-foreground">
            Gallery
          </Link>
          <Link href="/pricing" className="text-sm text-foreground">
            Pricing
          </Link>
          {profile ? (
            <>
              <Link href="/dashboard" className="text-sm text-foreground font-medium">
                Dashboard
              </Link>
              <Link href="/account" className="text-sm text-foreground">
                Account
              </Link>
              <button
                onClick={handleSignOut}
                className="text-left text-sm text-destructive"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium text-center"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
