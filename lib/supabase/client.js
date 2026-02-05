import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          const value = document.cookie
            .split("; ")
            .find((row) => row.startsWith(name + "="))
            ?.split("=")[1];
          return value;
        },
        set(name, value, options) {
          document.cookie = `${name}=${value}; path=/`;
        },
        remove(name) {
          document.cookie = `${name}=; Max-Age=0; path=/`;
        },
      },
    }
  );
}
