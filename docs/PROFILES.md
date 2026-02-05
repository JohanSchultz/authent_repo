# User profiles (Supabase)

## Database

- **Table:** `public.profiles` — one row per user, linked 1-to-1 to `auth.users` via `id` (FK to `auth.users(id)` with `ON DELETE CASCADE`).
- **Creation:** A **database trigger** runs on `AFTER INSERT ON auth.users` and inserts a row into `profiles`. No frontend logic creates profiles.
- **RLS:** Row Level Security is enabled. Policies:
  - **SELECT:** `auth.uid() = id` — users see only their own row.
  - **UPDATE:** `auth.uid() = id` (and `WITH CHECK`) — users can update only their own row.
  - No INSERT for authenticated users (profiles are created only by the trigger).

## Applying the SQL

Run the migration in the Supabase project:

1. **Dashboard:** Project → **SQL Editor** → New query → paste contents of `supabase/migrations/20250205000000_create_profiles.sql` → Run.
2. **CLI:** From the project root, `supabase db push` (or `supabase migration up`) if you use Supabase CLI and link the project.

## How the app reads (and updates) the profile

1. **Authentication:** The user is already signed in (e.g. via Supabase Auth). Each request sends the session (JWT) in cookies; the Supabase client uses it so `auth.uid()` is set in the database.

2. **Server (e.g. App Router):**  
   Use the **server** Supabase client and the shared helpers:

   ```js
   import { createClient } from "@/lib/supabase/server";
   import { getProfile } from "@/lib/profile";

   export default async function Page() {
     const supabase = await createClient();
     const profile = await getProfile(supabase);
     // profile is the row for the current user, or null if not found / not logged in
     return <div>{profile?.display_name ?? "No name"}</div>;
   }
   ```

3. **Client:**  
   Use the **browser** Supabase client so the same JWT is sent:

   ```js
   import { createClient } from "@/lib/supabase/client";
   import { getProfile, updateProfile } from "@/lib/profile";

   const supabase = createClient();
   const profile = await getProfile(supabase);
   const { data, error } = await updateProfile(supabase, { display_name: "New Name" });
   ```

4. **Why it works:**  
   `createClient()` (server or client) attaches the user’s session to requests. Supabase sets `auth.uid()` from that JWT. RLS allows `SELECT` and `UPDATE` only where `auth.uid() = id`, so the app only reads and updates the current user’s profile.

## Helpers

- **`lib/profile.js`**
  - `getProfile(supabase)` — fetches the current user’s profile (or `null`).
  - `updateProfile(supabase, { display_name?, avatar_url? })` — updates the current user’s profile; RLS restricts to their row.
