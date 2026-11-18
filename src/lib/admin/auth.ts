import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminContext =
  | { status: "anonymous" }
  | { status: "forbidden"; email: string | null }
  | { status: "admin"; email: string | null; userId: string };

/**
 * Resolves the current user and whether they are in `public.admins` (via the `is_admin()` RPC,
 * evaluated by Postgres as the signed-in user). Memoized per request.
 */
export const getAdminContext = cache(async (): Promise<AdminContext> => {
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return { status: "anonymous" };

  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  const email = userData.user.email ?? null;
  if (rpcError || isAdmin !== true) return { status: "forbidden", email };
  return { status: "admin", email, userId: userData.user.id };
});

/**
 * Page-level guard. Layouts are not a security boundary (page segments can be fetched on their own),
 * so every admin page calls this too. Deduped with the layout's check via React `cache`.
 */
export async function requireAdminPage() {
  const ctx = await getAdminContext();
  if (ctx.status === "anonymous") redirect("/admin/login");
  if (ctx.status === "forbidden") notFound();
  return ctx;
}

export class AdminAuthError extends Error {
  constructor(message = "You must be signed in as an admin to do that.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

/**
 * For server actions: returns the session-aware Supabase client after re-verifying admin rights.
 * RLS still enforces every write; this check just gives a clean error message early.
 */
export async function requireAdmin() {
  const ctx = await getAdminContext();
  if (ctx.status !== "admin") throw new AdminAuthError();
  return createClient();
}
