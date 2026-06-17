import { cache } from "react";
import { createClient } from "./server";
import type { Profile } from "@/types";

// Wrapped in React cache() so multiple RSCs in one request share one DB query.
export const getAuthenticatedProfile = cache(async (): Promise<Profile | null> => {
  // Skip if Supabase isn't configured (dev without .env.local)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
});
