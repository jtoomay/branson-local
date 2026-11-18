import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getSubmission, listSubmissions, requestNow, type InboxFilter } from "@/lib/admin/queries";
import { InboxActions } from "@/components/admin/inbox-actions";
import { Badge, Card, EmptyState, formatDate, PageHeader, timeAgo } from "@/components/admin/ui";
import { IconChevronLeft, IconInbox, IconMail, IconPhone, IconStore } from "@/components/admin/icons";
import type { ContactSubmission } from "@/lib/database.types";

export const metadata: Metadata = { title: "Inbox" };

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: "unread", label: "Unread" },
  { key: "handled", label: "Handled" },
  { key: "all", label: "All" },
];

function href(filter: InboxFilter, id?: string) {
  const p = new URLSearchParams();
  if (filter !== "unread") p.set("filter", filter);
  if (id) p.set("id", id);
  const qs = p.toString();
  return qs ? `/admin/inbox?${qs}` : "/admin/inbox";
}

function KindBadge({ kind }: { kind: ContactSubmission["kind"] }) {
  return kind === "advertise" ? <Badge tone="violet">Advertise</Badge> : <Badge tone="blue">Contact</Badge>;
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const sp = await searchParams;
  const rawFilter = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
  const filter: InboxFilter = rawFilter === "handled" || rawFilter === "all" ? rawFilter : "unread";
  const selectedId = (Array.isArray(sp.id) ? sp.id[0] : sp.id) ?? "";

  const [items, selected] = await Promise.all([listSubmissions(filter), selectedId ? getSubmission(selectedId) : null]);
  const now = requestNow();

  return (
    <>
      <PageHeader title="Inbox" description="Messages from the contact and advertise forms." />

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:divide-x md:divide-zinc-100">
          {/* List */}
          <div className={selected ? "hidden md:block" : ""}>
            <nav aria-label="Inbox filter" className="flex gap-1 border-b border-zinc-100 p-2">
              {FILTERS.map((f) => (
                <Link
                  key={f.key}
                  href={href(f.key)}
                  aria-current={filter === f.key ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-[#155D6B] ${
                    filter === f.key ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </nav>
            {items.length === 0 ? (
              <EmptyState icon={<IconInbox />} title={filter === "unread" ? "Inbox zero" : "No messages"}>
                {filter === "unread" ? "Every message has been handled." : "Nothing here yet."}
              </EmptyState>
            ) : (
              <ul className="max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto" aria-label="Messages">
                {items.map((m) => {
                  const active = selected?.id === m.id;
                  return (
                    <li key={m.id}>
                      <Link
                        href={href(filter, m.id)}
                        aria-current={active ? "true" : undefined}
                        className={`block px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#155D6B] ${
                          active ? "bg-[#155D6B]/[0.06]" : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!m.handled && <span className="size-2 shrink-0 rounded-full bg-[#155D6B]" aria-label="Unread" />}
                          <span className={`min-w-0 flex-1 truncate text-sm ${m.handled ? "text-zinc-700" : "font-semibold text-zinc-900"}`}>
                            {m.name}
                          </span>
                          <time dateTime={m.created_at} className="shrink-0 text-xs text-zinc-400">
                            {timeAgo(m.created_at, now)}
                          </time>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <KindBadge kind={m.kind} />
                          <p className="min-w-0 flex-1 truncate text-[13px] text-zinc-500">{m.message}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Detail */}
          <div className={selected ? "" : "hidden md:block"}>
            {selected ? (
              <article className="p-5 sm:p-6" aria-labelledby="msg-title">
                <Link
                  href={href(filter)}
                  className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 md:hidden"
                >
                  <IconChevronLeft size={14} />
                  All messages
                </Link>
                <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <KindBadge kind={selected.kind} />
                      {selected.handled ? <Badge tone="green">Handled</Badge> : <Badge tone="amber">Unread</Badge>}
                    </div>
                    <h2 id="msg-title" className="mt-2 text-lg font-semibold text-zinc-900">
                      {selected.name}
                    </h2>
                    <p className="text-[13px] text-zinc-500">
                      <time dateTime={selected.created_at}>{formatDate(selected.created_at, true)}</time>
                    </p>
                  </div>
                  <InboxActions
                    key={`${selected.id}-${selected.handled}`}
                    id={selected.id}
                    handled={selected.handled}
                    name={selected.name}
                    backHref={href(filter)}
                  />
                </div>

                <dl className="grid gap-3 py-5 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2.5">
                    <dt className="text-zinc-400">
                      <IconMail />
                      <span className="sr-only">Email</span>
                    </dt>
                    <dd className="min-w-0">
                      <a
                        href={`mailto:${selected.email}?subject=${encodeURIComponent(
                          selected.kind === "advertise" ? "Advertising on Branson Local Businesses" : "Re: your message to Branson Local Businesses",
                        )}`}
                        className="break-all font-medium text-[#155D6B] hover:underline"
                      >
                        {selected.email}
                      </a>
                    </dd>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2.5">
                      <dt className="text-zinc-400">
                        <IconPhone />
                        <span className="sr-only">Phone</span>
                      </dt>
                      <dd>
                        <a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-[#155D6B] hover:underline">
                          {selected.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {selected.business && (
                    <div className="flex items-center gap-2.5 sm:col-span-2">
                      <dt className="text-zinc-400">
                        <IconStore />
                        <span className="sr-only">Business</span>
                      </dt>
                      <dd className="text-zinc-700">{selected.business}</dd>
                    </div>
                  )}
                </dl>

                <div className="whitespace-pre-wrap break-words rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800 ring-1 ring-inset ring-zinc-100">
                  {selected.message}
                </div>
              </article>
            ) : (
              <EmptyState icon={<IconMail />} title={selectedId ? "Message not found" : "Select a message"}>
                {selectedId ? "It may have been deleted." : "Choose a message from the list to read it and reply."}
              </EmptyState>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
