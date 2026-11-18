import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(21,93,107,0.14),transparent)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-[#155D6B] text-sm font-bold text-white shadow-md shadow-[#155D6B]/30">
            BL
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">Sign in to Branson Local</h1>
          <p className="mt-1 text-sm text-zinc-500">Directory administration</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
          {/* LoginForm reads ?next= via useSearchParams, which needs a Suspense boundary. */}
          <Suspense fallback={<div className="h-56" aria-hidden="true" />}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">Access is restricted to directory administrators.</p>
      </div>
    </main>
  );
}
