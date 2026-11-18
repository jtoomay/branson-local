"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/admin/actions/auth";
import type { SignInResult } from "@/lib/admin/actions/auth";
import { IconAlert, IconSpinner } from "./icons";
import { btn, Field, fieldAria, inputCls } from "./ui";

const initial: SignInResult = { ok: true, message: "" };

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  const [state, action, pending] = useActionState(signIn, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {!state.ok && state.message && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}
      <Field id="email" label="Email" error={errors.email}>
        <input
          {...fieldAria("email", errors.email)}
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.data?.email}
          key={state.data?.email ?? "email"}
          required
          autoFocus
          className={inputCls}
          placeholder="you@example.com"
        />
      </Field>
      <Field id="password" label="Password" error={errors.password}>
        <input
          {...fieldAria("password", errors.password)}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </Field>
      <button type="submit" className={`${btn.primary} h-10 w-full`} disabled={pending} aria-busy={pending}>
        {pending && <IconSpinner />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
