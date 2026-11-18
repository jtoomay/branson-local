"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, str } from "../schemas";
import type { ActionResult } from "../types";

const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

/** Only allow relative redirects back into the admin. */
function safeNext(raw: string) {
  return raw.startsWith("/admin") && !raw.startsWith("//") && !raw.includes("\\") ? raw : "/admin";
}

export type SignInResult = ActionResult<{ email: string }>;

export async function signIn(_prev: SignInResult, formData: FormData): Promise<SignInResult> {
  const email = str(formData, "email").trim().slice(0, 320);
  const parsed = loginSchema.safeParse({ email, password: str(formData, "password") });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), data: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Deliberately generic: do not reveal whether the account exists.
    return { ok: false, message: "Incorrect email or password.", data: { email } };
  }

  redirect(safeNext(str(formData, "next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
