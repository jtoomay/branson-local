import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getDashboardData, requestNow } from "@/lib/admin/queries";
import { Badge, btn, Card, CardHeader, EmptyState, LogoThumb, PageHeader, timeAgo } from "@/components/admin/ui";
import { IconChevronRight, IconInbox, IconPlus, IconStar, IconStore, IconTag, IconExternal } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireAdminPage();
  const { totals, recent, categories, submissions } = await getDashboardData();
  const now = requestNow();
  const maxCount = Math.max(1, ...categories.map((c) => c.count));

  const stats = [
    { label: "Businesses", value: totals.businesses, href: "/admin/businesses", icon: IconStore, note: `${totals.businesses - totals.published} unpublished` },
    {
      label: "Published",
      value: totals.published,
      href: "/admin/businesses?status=published",
      icon: IconExternal,
      note: totals.businesses ? `${Math.round((totals.published / totals.businesses) * 100)}% of directory` : "—",
    },
    { label: "Featured", value: totals.featured, href: "/admin/businesses?featured=yes", icon: IconStar, note: "Shown on the homepage" },
    {
      label: "Unread messages",
      value: totals.unread,
      href: "/admin/inbox",
      icon: IconInbox,
      note: totals.unread ? "Needs a reply" : "Inbox zero",
      highlight: totals.unread > 0,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of the Branson Local Businesses directory."
        actions={
          <>
            <Link href="/admin/categories" className={btn.secondary}>
              <IconTag />
              Categories
            </Link>
            <Link href="/admin/businesses/new" className={btn.primary}>
              <IconPlus />
              Add business
            </Link>
          </>
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="group block h-full rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs transition hover:border-zinc-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B] sm:p-5"
            >
              <div className="flex items-center justify-between text-[13px] font-medium text-zinc-500">
                {s.label}
                <span
                  className={`grid size-7 place-items-center rounded-lg ${
                    s.highlight ? "bg-[#155D6B] text-white" : "bg-zinc-100 text-zinc-500 group-hover:text-[#155D6B]"
                  }`}
                >
                  <s.icon size={15} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-3xl">{s.value}</p>
              <p className="mt-1 truncate text-xs text-zinc-500">{s.note}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Recently updated"
            description="The latest edits across the directory"
            action={
              <Link href="/admin/businesses?sort=updated_at&dir=desc" className="text-[13px] font-medium text-[#155D6B] hover:underline">
                View all
              </Link>
            }
          />
          {recent.length === 0 ? (
            <EmptyState icon={<IconStore />} title="No businesses yet" />
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/businesses/${b.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
                  >
                    <LogoThumb src={b.logo_url} name={b.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{b.name}</p>
                      <p className="text-xs text-zinc-500">Updated {timeAgo(b.updated_at, now)}</p>
                    </div>
                    <div className="hidden items-center gap-1.5 sm:flex">
                      {b.featured && <Badge tone="amber">Featured</Badge>}
                      {b.is_published ? <Badge tone="green" dot>Live</Badge> : <Badge dot>Draft</Badge>}
                    </div>
                    <IconChevronRight className="text-zinc-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Businesses by category"
              action={
                <Link href="/admin/categories" className="text-[13px] font-medium text-[#155D6B] hover:underline">
                  Manage
                </Link>
              }
            />
            <ul className="space-y-3 px-5 py-4">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/businesses?category=${c.id}`}
                    className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#155D6B]"
                  >
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate text-zinc-700 group-hover:text-zinc-900">{c.name}</span>
                      <span className="tabular-nums text-zinc-500">{c.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
                      <div className="h-full rounded-full bg-[#155D6B]/80 transition-all group-hover:bg-[#155D6B]" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Unread messages"
              action={
                <Link href="/admin/inbox" className="text-[13px] font-medium text-[#155D6B] hover:underline">
                  Open inbox
                </Link>
              }
            />
            {submissions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-zinc-500">You&rsquo;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {submissions.map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/inbox?id=${s.id}`} className="block px-5 py-3 hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-zinc-900">{s.name}</span>
                        <Badge tone={s.kind === "advertise" ? "violet" : "blue"}>{s.kind === "advertise" ? "Advertise" : "Contact"}</Badge>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500">{s.message}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
