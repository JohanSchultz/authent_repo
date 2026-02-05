/**
 * Profile helpers for the public.profiles table.
 *
 * The profiles table is 1-to-1 with auth.users, created by a DB trigger.
 * RLS allows only SELECT and UPDATE where auth.uid() = id.
 *
 * Usage:
 * - Server: pass the Supabase client from createClient() in lib/supabase/server.js
 * - Client: pass the Supabase client from createClient() in lib/supabase/client.js
 */

/**
 * Fetch the current user's profile. Returns null if not found or not authenticated.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ id: string, display_name: string | null, avatar_url: string | null, created_at: string, updated_at: string } | null>}
 */
export async function getProfile(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no row
    throw error;
  }
  return data;
}

/**
 * Update the current user's profile. RLS ensures only the owner can update.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ display_name?: string, avatar_url?: string }} updates
 * @returns {Promise<{ data: object | null, error: object | null }>}
 */
export async function updateProfile(supabase, updates) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: { message: "Not authenticated" } };
  }

  return supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();
}
