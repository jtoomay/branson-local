import "server-only";
import { revalidatePath } from "next/cache";
import { AdminAuthError } from "../auth";
import type { ActionResult } from "../types";

/** Purge every cached page (public ISR pages and the admin) after a mutation. */
export function revalidateAll() {
  revalidatePath("/", "layout");
}

export function failure(error: unknown, fallback = "Something went wrong. Please try again."): ActionResult<never> {
  if (error instanceof AdminAuthError) return { ok: false, message: error.message };
  console.error("[admin action]", error);
  return { ok: false, message: error instanceof Error && error.message ? error.message : fallback };
}

/** Postgres unique_violation */
export function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === "23505";
}
