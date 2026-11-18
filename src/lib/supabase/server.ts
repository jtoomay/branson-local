import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createPlainClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Session-aware client for Server Components, Server Actions and Route Handlers. RLS applies as the signed-in user. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — cookies are read-only there; middleware refreshes the session.
        }
      },
    },
  });
}

/** Cookie-less anonymous client for public, cacheable reads (ISR / generateStaticParams / sitemap). */
export function createPublicClient() {
  return createPlainClient(url, key, { auth: { persistSession: false } });
}
