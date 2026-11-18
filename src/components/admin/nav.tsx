"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDashboard, IconInbox, IconStore, IconTag } from "./icons";

const items = [
  { href: "/admin", label: "Dashboard", short: "Home", icon: IconDashboard, exact: true },
  { href: "/admin/businesses", label: "Businesses", short: "Businesses", icon: IconStore },
  { href: "/admin/categories", label: "Categories", short: "Categories", icon: IconTag },
  { href: "/admin/inbox", label: "Inbox", short: "Inbox", icon: IconInbox, badge: true },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
}

function UnreadBadge({ count, compact = false }: { count: number; compact?: boolean }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={
        compact
          ? "absolute -top-1 left-1/2 ml-1.5 min-w-4 rounded-full bg-[#155D6B] px-1 text-center text-[10px] font-semibold leading-4 text-white ring-2 ring-white"
          : "ml-auto min-w-5 rounded-full bg-[#155D6B] px-1.5 text-center text-[11px] font-semibold leading-5 text-white"
      }
    >
      {label}
      <span className="sr-only"> unread {count === 1 ? "message" : "messages"}</span>
    </span>
  );
}

export function SidebarNav({ unread }: { unread: number }) {
  const isActive = useIsActive();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item.href, "exact" in item ? item.exact : false);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#155D6B] ${
              active ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200/80" : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
            }`}
          >
            <Icon size={17} className={active ? "text-[#155D6B]" : "text-zinc-400 group-hover:text-zinc-600"} />
            {item.label}
            {"badge" in item && <UnreadBadge count={unread} />}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomTabs({ unread }: { unread: number }) {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = isActive(item.href, "exact" in item ? item.exact : false);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#155D6B] ${
                  active ? "text-[#155D6B]" : "text-zinc-500"
                }`}
              >
                <span className="relative">
                  <Icon size={20} />
                  {"badge" in item && <UnreadBadge count={unread} compact />}
                </span>
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
