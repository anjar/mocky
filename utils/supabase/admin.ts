import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a server-side Supabase client with the service role key.
 * This client bypasses Row Level Security (RLS) policies, allowing admin views
 * to fetch users, projects, and endpoints across all tenants.
 */
export const createAdminClient = async (cookieStorePromise: ReturnType<typeof cookies>) => {
  const cookieStore = await cookieStorePromise;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Always prioritize the service role key to bypass RLS in admin dashboard
  // We fall back to the publishable key or env var if not set
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handled silently
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // Handled silently
        }
      },
    },
  });
};

/**
 * Checks if a user has the admin role.
 * Role check looks for:
 * 1. user.user_metadata.role === 'is_admin'
 * 2. user.user_metadata.is_admin === true
 * 3. user.app_metadata.role === 'is_admin'
 * 4. user.app_metadata.is_admin === true
 * 5. Or if the email is 'admin@mocky.com' / similar admin email as fallback
 */
export function isUserAdmin(user: any): boolean {
  if (!user) return false;

  const userMeta = user.user_metadata || {};
  const appMeta = user.app_metadata || {};

  if (
    userMeta.role === "is_admin" ||
    userMeta.is_admin === true ||
    userMeta.is_admin === "true" ||
    appMeta.role === "is_admin" ||
    appMeta.is_admin === true ||
    appMeta.is_admin === "true"
  ) {
    return true;
  }

  // Check fallback email domain/prefix
  if (user.email && (user.email === "admin@mocky.com" || user.email.startsWith("admin+"))) {
    return true;
  }

  return false;
}
