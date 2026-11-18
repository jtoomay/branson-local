import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getCategories, listBusinesses, parseBusinessFilters } from "@/lib/admin/queries";
import { businessesHref } from "@/lib/admin/url";
import { PAGE_SIZE } from "@/lib/admin/types";
import { BusinessFilters } from "@/components/admin/business-filters";
import { BusinessesTable } from "@/components/admin/businesses-table";
import { btn, Card, PageHeader } from "@/components/admin/ui";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Businesses" };

export default async function BusinessesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const filters = parseBusinessFilters(await searchParams);
  const [{ rows, total }, categories] = await Promise.all([listBusinesses(filters), getCategories()]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, filters.page * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Businesses"
        description={`${total} ${total === 1 ? "business" : "businesses"}${filters.q || filters.category || filters.status !== "all" || filters.featured !== "all" ? " match your filters" : " in the directory"}.`}
        actions={
          <Link href="/admin/businesses/new" className={btn.primary}>
            <IconPlus />
            Add business
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <BusinessFilters filters={filters} categories={categories.map(({ id, name }) => ({ id, name }))} />
        <BusinessesTable key={rows.map((r) => r.id).join(",")} rows={rows} filters={filters} />

        {total > 0 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 text-[13px] text-zinc-500"
          >
            <p>
              Showing <span className="font-medium text-zinc-800 tabular-nums">{from}</span>–
              <span className="font-medium text-zinc-800 tabular-nums">{to}</span> of{" "}
              <span className="font-medium text-zinc-800 tabular-nums">{total}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <PageLink disabled={filters.page <= 1} href={businessesHref(filters, { page: filters.page - 1 })} label="Previous page">
                <IconChevronLeft />
              </PageLink>
              <span className="px-1.5 tabular-nums" aria-current="page">
                Page {Math.min(filters.page, pages)} of {pages}
              </span>
              <PageLink disabled={filters.page >= pages} href={businessesHref(filters, { page: filters.page + 1 })} label="Next page">
                <IconChevronRight />
              </PageLink>
            </div>
          </nav>
        )}
      </Card>
    </>
  );
}

function PageLink({ href, disabled, label, children }: { href: string; disabled: boolean; label: string; children: React.ReactNode }) {
  if (disabled) {
    return (
      <span className={`${btn.secondary} ${btn.sm} cursor-not-allowed opacity-50`} aria-disabled="true" aria-label={label}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${btn.secondary} ${btn.sm}`} aria-label={label}>
      {children}
    </Link>
  );
}
