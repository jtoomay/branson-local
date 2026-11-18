import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Admin-only proxy (Next 16's renamed middleware).
 *
 * 1. Refreshes the Supabase session cookies on every /admin request (standard @supabase/ssr pattern),
 *    so Server Components, which cannot write cookies, always see a fresh access token.
 * 2. Optimistic auth redirect: unauthenticated /admin/* -> /admin/login?next=...
 *    and authenticated /admin/login -> /admin.
 *
 * This is NOT the authorization boundary. The admin layout re-checks `is_admin()` on the server,
 * every server action re-verifies, and Postgres RLS enforces all writes.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims(); it validates (and refreshes) the session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!signedIn && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
    return withCookies(NextResponse.redirect(url), response);
  }

  if (signedIn && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

/** Carry refreshed auth cookies over to a redirect response. */
function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  target.headers.set("X-Robots-Tag", "noindex, nofollow");
  return target;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
