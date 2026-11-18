"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/database.types";
import { businessesHref, type ListFilters } from "@/lib/admin/url";
import { BUSINESS_SORTS, type BusinessSort } from "@/lib/admin/types";
import { IconGrid, IconRows, IconSearch, IconSpinner, IconX } from "./icons";
import { inputCls, selectCls } from "./ui";

export function BusinessFilters({
  filters,
  categories,
}: {
  filters: ListFilters;
  categories: Pick<Category, "id" | "name">[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = (patch: Partial<ListFilters>) => {
    startTransition(() => router.replace(businessesHref(filters, patch), { scroll: false }));
  };

  // Debounced search; clear any pending timer on unmount.
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onSearch = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => go({ q: value.trim() }), 300);
  };

  const active = filters.q || filters.category || filters.status !== "all" || filters.featured !== "all";

  return (
    <div className="flex flex-col gap-3 border-b border-zinc-100 p-3 sm:p-4 xl:flex-row xl:items-center" aria-busy={pending}>
      <form
        role="search"
        className="relative flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (timer.current) clearTimeout(timer.current);
          go({ q: q.trim() });
        }}
      >
        <label htmlFor="biz-search" className="sr-only">
          Search businesses by name
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
          {pending ? <IconSpinner /> : <IconSearch />}
        </span>
        <input
          id="biz-search"
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name…"
          className={`${inputCls} h-9 pl-9`}
          autoComplete="off"
        />
      </form>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <label className="sr-only" htmlFor="f-category">
          Category
        </label>
        <select
          id="f-category"
          value={filters.category}
          onChange={(e) => go({ category: e.target.value })}
          className={`${selectCls} h-9 sm:w-44`}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-status">
          Status
        </label>
        <select
          id="f-status"
          value={filters.status}
          onChange={(e) => go({ status: e.target.value as ListFilters["status"] })}
          className={`${selectCls} h-9 sm:w-36`}
        >
          <option value="all">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Unpublished</option>
        </select>

        <label className="sr-only" htmlFor="f-featured">
          Featured
        </label>
        <select
          id="f-featured"
          value={filters.featured}
          onChange={(e) => go({ featured: e.target.value as ListFilters["featured"] })}
          className={`${selectCls} h-9 sm:w-36`}
        >
          <option value="all">Featured: any</option>
          <option value="yes">Featured only</option>
          <option value="no">Not featured</option>
        </select>

        <label className="sr-only" htmlFor="f-sort">
          Sort by
        </label>
        <select
          id="f-sort"
          value={`${filters.sort}:${filters.dir}`}
          onChange={(e) => {
            const [sort, dir] = e.target.value.split(":") as [BusinessSort, "asc" | "desc"];
            go({ sort, dir });
          }}
          className={`${selectCls} h-9 sm:w-44`}
        >
          {(Object.keys(BUSINESS_SORTS) as BusinessSort[]).flatMap((key) => [
            <option key={`${key}:asc`} value={`${key}:asc`}>
              {BUSINESS_SORTS[key]} {key === "name" ? "(A–Z)" : key === "sort_order" ? "(low first)" : "(oldest)"}
            </option>,
            <option key={`${key}:desc`} value={`${key}:desc`}>
              {BUSINESS_SORTS[key]} {key === "name" ? "(Z–A)" : key === "sort_order" ? "(high first)" : "(newest)"}
            </option>,
          ])}
        </select>

        <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
          {active && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                go({ q: "", category: "", status: "all", featured: "all" });
              }}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-[#155D6B]"
            >
              <IconX size={14} />
              Clear
            </button>
          )}
          <div className="ml-auto hidden rounded-lg bg-zinc-100 p-0.5 md:flex" role="group" aria-label="Layout">
            {(["table", "cards"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={filters.view === v}
                onClick={() => go({ view: v, page: filters.page })}
                className={`grid h-8 w-8 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-[#155D6B] ${
                  filters.view === v ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {v === "table" ? <IconRows /> : <IconGrid />}
                <span className="sr-only">{v === "table" ? "Table view" : "Card view"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
