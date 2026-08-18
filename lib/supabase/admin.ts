/**
 * SERVER-ONLY Supabase admin client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS for trusted
 * server-side operations (question catalog sync, cron jobs, etc.)
 *
 * NEVER import this file from a client component or any file that
 * may be bundled for the browser. The service-role key must stay
 * server-side at all times.
 *
 * Safe usage: API route handlers, Server Actions, Server Components.
 */
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error(
      'Missing env var: SUPABASE_SERVICE_ROLE_KEY — required for server-side sync operations'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto session management — this client is stateless/server-only
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
