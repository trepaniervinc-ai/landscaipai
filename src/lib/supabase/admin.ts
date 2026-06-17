import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily initialized to avoid "supabaseUrl is required" errors at build time
// when env vars are not available during static analysis.
let _client: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _client;
}

// Named export alias for backwards compat with code that spreads the client directly
export const adminClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getAdminClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
