"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import type { BusinessListRow } from "@/lib/admin/queries";
import { bulkBusinesses, setBusinessFlag, type BulkOp } from "@/lib/admin/actions/businesses";
import { businessesHref, type ListFilters } from "@/lib/admin/url";
import type { BusinessSort } from "@/lib/admin/types";
import { ConfirmDialog } from "./dialog";
import { IconChevronDown, IconChevronUp, IconExternal, IconPencil, IconSort, IconSpinner, IconStore, IconTrash, IconX } from "./icons";
import { Switch } from "./switch";
import { useToast } from "./toast";
import { Badge, btn, checkboxCls, EmptyState, LogoThumb } from "./ui";

type Flag = "is_published" | "featured";
type OptimisticPatch = { ids: string[]; field: Flag; value: boolean };

export function BusinessesTable({ rows, filters }: { rows: BusinessListRow[]; filters: ListFilters }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bulkPending, startBulk] = useTransition();
  const [, startToggle] = useTransition();
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());

  const [optimisticRows, applyOptimistic] = useOptimistic(rows, (state, patch: OptimisticPatch) =>
    state.map((r) => (patch.ids.includes(r.id) ? { ...r, [patch.field]: patch.value } : r)),
  );

  // Drop selections that are no longer on the page (e.g. after a bulk delete or navigation).
  const visibleSelected = new Set([...selected].filter((id) => rows.some((r) => r.id === id)));
  const allSelected = rows.length > 0 && visibleSelected.size === rows.length;
  const someSelected = visibleSelected.size > 0 && !allSelected;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set([...prev].filter((x) => rows.some((r) => r.id === x)));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const toggleFlag = (row: BusinessListRow, field: Flag, value: boolean) => {
    setBusyIds((s) => new Set(s).add(row.id));
    startToggle(async () => {
      applyOptimistic({ ids: [row.id], field, value });
      const res = await setBusinessFlag(row.id, field, value);
      toast.result(res);
      setBusyIds((s) => {
        const next = new Set(s);
        next.delete(row.id);
        return next;
      });
    });
  };

  const runBulk = (op: BulkOp) => {
    const ids = [...visibleSelected];
    startBulk(async () => {
      if (op !== "delete") {
        const field: Flag = op === "publish" || op === "unpublish" ? "is_published" : "featured";
        applyOptimistic({ ids, field, value: op === "publish" || op === "feature" });
      }
      const res = await bulkBusinesses(ids, op);
      toast.result(res);
      if (res.ok) {
        setSelected(new Set());
        setConfirmDelete(false);
      }
    });
  };

  if (rows.length === 0) {
    return (
      <EmptyState icon={<IconStore />} title="No businesses match these filters">
        Try a different search or{" "}
        <Link href="/admin/businesses" className="font-medium text-[#155D6B] hover:underline">
          clear all filters
        </Link>
        .
      </EmptyState>
    );
  }

  const selectedNames = rows.filter((r) => visibleSelected.has(r.id)).map((r) => r.name);

  return (
    <>
      {/* Table: md+ and table view */}
      <div className={filters.view === "table" ? "hidden md:block" : "hidden"}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Businesses</caption>
          <thead className="border-b border-zinc-100 bg-zinc-50/60 text-xs font-medium text-zinc-500">
            <tr>
              <th scope="col" className="w-10 py-2.5 pl-4 pr-2">
                <input
                  type="checkbox"
                  className={checkboxCls}
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all businesses on this page"
                />
              </th>
              <SortHeader label="Business" sort="name" filters={filters} />
              <th scope="col" className="hidden px-3 py-2.5 lg:table-cell">
                Categories
              </th>
              <th scope="col" className="w-24 px-3 py-2.5">
                Published
              </th>
              <th scope="col" className="w-24 px-3 py-2.5">
                Featured
              </th>
              <SortHeader label="Order" sort="sort_order" filters={filters} className="hidden w-20 xl:table-cell" />
              <SortHeader label="Updated" sort="updated_at" filters={filters} className="hidden w-32 lg:table-cell" />
              <th scope="col" className="w-20 py-2.5 pl-3 pr-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {optimisticRows.map((row) => {
              const isSelected = visibleSelected.has(row.id);
              return (
                <tr key={row.id} className={`group transition-colors ${isSelected ? "bg-[#155D6B]/[0.04]" : "hover:bg-zinc-50/80"}`}>
                  <td className="py-2.5 pl-4 pr-2">
                    <input
                      type="checkbox"
                      className={checkboxCls}
                      checked={isSelected}
                      onChange={() => toggleOne(row.id)}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="max-w-0 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <LogoThumb src={row.logo_url} name={row.name} />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/businesses/${row.id}`}
                          className="block truncate font-medium text-zinc-900 hover:text-[#155D6B] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B]"
                        >
                          {row.name}
                        </Link>
                        <p className="truncate text-xs text-zinc-500">/{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 lg:table-cell">
                    <CategoryChips categories={row.categories} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Switch
                      size="sm"
                      checked={row.is_published}
                      disabled={busyIds.has(row.id)}
                      onChange={(v) => toggleFlag(row, "is_published", v)}
                      label={`Published: ${row.name}`}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Switch
                      size="sm"
                      checked={row.featured}
                      disabled={busyIds.has(row.id)}
                      onChange={(v) => toggleFlag(row, "featured", v)}
                      label={`Featured: ${row.name}`}
                    />
                  </td>
                  <td className="hidden px-3 py-2.5 tabular-nums text-zinc-500 xl:table-cell">{row.sort_order}</td>
                  <td className="hidden px-3 py-2.5 text-zinc-500 lg:table-cell">
                    <time dateTime={row.updated_at}>{shortDate(row.updated_at)}</time>
                  </td>
                  <td className="py-2.5 pl-3 pr-4">
                    <RowActions row={row} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards: always on mobile; on desktop when view=cards */}
      <div className={filters.view === "table" ? "md:hidden" : ""}>
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2.5 text-xs text-zinc-500">
          <input
            id="select-all-cards"
            type="checkbox"
            className={checkboxCls}
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={toggleAll}
          />
          <label htmlFor="select-all-cards">Select all on this page</label>
        </div>
        <ul className={filters.view === "cards" ? "grid gap-3 p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-3" : "divide-y divide-zinc-100"}>
          {optimisticRows.map((row) => {
            const isSelected = visibleSelected.has(row.id);
            return (
              <li
                key={row.id}
                className={
                  filters.view === "cards"
                    ? `rounded-xl border p-4 transition-colors ${isSelected ? "border-[#155D6B]/40 bg-[#155D6B]/[0.03]" : "border-zinc-200"}`
                    : `p-4 ${isSelected ? "bg-[#155D6B]/[0.04]" : ""}`
                }
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className={`${checkboxCls} mt-2.5`}
                    checked={isSelected}
                    onChange={() => toggleOne(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                  <LogoThumb src={row.logo_url} name={row.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/businesses/${row.id}`} className="block truncate font-medium text-zinc-900 hover:text-[#155D6B]">
                      {row.name}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">{row.tagline || `/${row.slug}`}</p>
                    <div className="mt-2">
                      <CategoryChips categories={row.categories} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-100 pt-3 text-[13px] text-zinc-600">
                  <span className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      checked={row.is_published}
                      disabled={busyIds.has(row.id)}
                      onChange={(v) => toggleFlag(row, "is_published", v)}
                      label={`Published: ${row.name}`}
                    />
                    <span aria-hidden="true">Published</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      checked={row.featured}
                      disabled={busyIds.has(row.id)}
                      onChange={(v) => toggleFlag(row, "featured", v)}
                      label={`Featured: ${row.name}`}
                    />
                    <span aria-hidden="true">Featured</span>
                  </span>
                  <span className="ml-auto">
                    <RowActions row={row} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bulk action bar */}
      {visibleSelected.size > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 pl-4 text-sm text-white shadow-2xl shadow-zinc-900/30 lg:bottom-6 lg:left-64 lg:ml-auto lg:mr-auto"
        >
          <span className="mr-auto font-medium tabular-nums">
            {visibleSelected.size} selected
          </span>
          {bulkPending && <IconSpinner className="text-zinc-400" />}
          <BulkButton onClick={() => runBulk("publish")} disabled={bulkPending}>
            Publish
          </BulkButton>
          <BulkButton onClick={() => runBulk("unpublish")} disabled={bulkPending}>
            Unpublish
          </BulkButton>
          <BulkButton onClick={() => runBulk("feature")} disabled={bulkPending} className="hidden sm:inline-flex">
            Feature
          </BulkButton>
          <BulkButton onClick={() => runBulk("unfeature")} disabled={bulkPending} className="hidden sm:inline-flex">
            Unfeature
          </BulkButton>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={bulkPending}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-600 px-2.5 text-[13px] font-medium hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
          >
            <IconTrash size={14} />
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Clear selection"
          >
            <IconX />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => runBulk("delete")}
        pending={bulkPending}
        title={`Delete ${visibleSelected.size} ${visibleSelected.size === 1 ? "business" : "businesses"}?`}
        description="This permanently removes them from the directory, along with their uploaded logos. This can’t be undone."
        confirmLabel={`Delete ${visibleSelected.size}`}
      >
        <ul className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px] text-zinc-700">
          {selectedNames.map((n) => (
            <li key={n} className="truncate py-0.5">
              {n}
            </li>
          ))}
        </ul>
      </ConfirmDialog>
    </>
  );
}

function BulkButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-8 items-center rounded-lg px-2.5 text-[13px] font-medium text-zinc-100 ring-1 ring-inset ring-white/15 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function RowActions({ row }: { row: BusinessListRow }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link href={`/admin/businesses/${row.id}`} className={btn.icon} aria-label={`Edit ${row.name}`} title="Edit">
        <IconPencil size={15} />
      </Link>
      <a
        href={`/business/${row.slug}`}
        target="_blank"
        rel="noopener"
        className={`${btn.icon} ${row.is_published ? "" : "pointer-events-none opacity-40"}`}
        aria-label={`View ${row.name} on site (opens in new tab)`}
        aria-disabled={!row.is_published}
        tabIndex={row.is_published ? undefined : -1}
        title={row.is_published ? "View on site" : "Unpublished: not visible on site"}
      >
        <IconExternal size={15} />
      </a>
    </div>
  );
}

function CategoryChips({ categories }: { categories: BusinessListRow["categories"] }) {
  if (!categories.length) return <span className="text-xs text-zinc-400">Uncategorized</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {categories.slice(0, 3).map((c) => (
        <Badge key={c.id}>{c.name}</Badge>
      ))}
      {categories.length > 3 && <Badge>+{categories.length - 3}</Badge>}
    </div>
  );
}

function SortHeader({
  label,
  sort,
  filters,
  className = "",
}: {
  label: string;
  sort: BusinessSort;
  filters: ListFilters;
  className?: string;
}) {
  const active = filters.sort === sort;
  const nextDir = active ? (filters.dir === "asc" ? "desc" : "asc") : sort === "name" || sort === "sort_order" ? "asc" : "desc";
  return (
    <th
      scope="col"
      className={`px-3 py-2.5 ${className}`}
      aria-sort={active ? (filters.dir === "asc" ? "ascending" : "descending") : undefined}
    >
      <Link
        href={businessesHref(filters, { sort, dir: nextDir })}
        scroll={false}
        className={`inline-flex items-center gap-1 rounded hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B] ${
          active ? "text-zinc-900" : ""
        }`}
      >
        {label}
        {active ? (
          filters.dir === "asc" ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />
        ) : (
          <IconSort size={13} className="text-zinc-300" />
        )}
      </Link>
    </th>
  );
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
}
