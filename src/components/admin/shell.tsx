import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/auth";
import { getUnreadCount } from "@/lib/admin/queries";
import { signOut } from "@/lib/admin/actions/auth";
import { BottomTabs, SidebarNav } from "./nav";
import { IconExternal, IconLock, IconLogout } from "./icons";
import { btn, Skeleton } from "./ui";

function Brand() {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B]"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-[#155D6B] text-[13px] font-bold tracking-tight text-white shadow-sm shadow-[#155D6B]/30">
        BL
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-zinc-900">Branson Local</span>
        <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500">Admin</span>
      </span>
    </Link>
  );
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOut}>
      <button type="submit" className={compact ? btn.icon : `${btn.ghost} w-full justify-start px-2.5`} aria-label={compact ? "Sign out" : undefined}>
        <IconLogout size={compact ? 18 : 16} />
        {!compact && "Sign out"}
      </button>
    </form>
  );
}

/** Server-gated admin chrome. Must render inside <Suspense> because it reads the session cookie. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const ctx = await getAdminContext();
  if (ctx.status === "anonymous") redirect("/admin/login");
  if (ctx.status === "forbidden") return <AccessDenied email={ctx.email} />;

  const unread = await getUnreadCount();

  return (
    <div className="min-h-dvh lg:pl-64">
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-200/80 bg-zinc-50 px-3 py-4 lg:flex">
        <div className="px-1.5 pb-5">
          <Brand />
        </div>
        <SidebarNav unread={unread} />
        <div className="mt-auto space-y-1 border-t border-zinc-200/80 pt-3">
          <Link href="/" className={`${btn.ghost} w-full justify-start px-2.5`} target="_blank" rel="noopener">
            <IconExternal />
            View site
          </Link>
          <SignOutButton />
          {ctx.email && (
            <p className="truncate px-2.5 pt-1 text-xs text-zinc-500" title={ctx.email}>
              {ctx.email}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <Link href="/" className={btn.icon} target="_blank" rel="noopener" aria-label="View site (opens in new tab)">
            <IconExternal size={18} />
          </Link>
          <SignOutButton compact />
        </div>
      </header>

      <main id="admin-main" className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        {children}
      </main>

      <BottomTabs unread={unread} />
    </div>
  );
}

function AccessDenied({ email }: { email: string | null }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
          <IconLock size={22} />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">Access denied</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {email ? (
            <>
              <span className="font-medium text-zinc-700">{email}</span> is signed in but is not an administrator.
            </>
          ) : (
            "This account is not an administrator."
          )}
        </p>
        <form action={signOut} className="mt-6">
          <button type="submit" className={`${btn.primary} w-full`}>
            Sign in with a different account
          </button>
        </form>
        <Link href="/" className="mt-3 inline-block text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline">
          Back to the public site
        </Link>
      </div>
    </main>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-dvh lg:pl-64" aria-busy="true" aria-label="Loading admin">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-2 border-r border-zinc-200/80 bg-zinc-50 px-4 py-5 lg:flex">
        <Skeleton className="mb-5 h-8 w-36" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </aside>
      <div className="h-14 border-b border-zinc-200 bg-white lg:hidden" />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <PageSkeleton />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-72 rounded-xl" />
    </div>
  );
}
