"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { BusinessCard, type CardBusiness } from "./business-card";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "");
}

/**
 * Client-side filter for a category's listings: free-text plus town chips.
 * The full list is server-rendered, so crawlers and no-JS visitors see everything.
 */
export function ListingExplorer({ businesses, categoryName }: { businesses: CardBusiness[]; categoryName: string }) {
  const [query, setQuery] = useState("");
  const [town, setTown] = useState<string | null>(null);
  const deferred = useDeferredValue(query);
  const inputId = useId();
  const statusId = useId();

  const towns = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of businesses) {
      const c = b.city?.trim();
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [businesses]);

  const index = useMemo(
    () =>
      businesses.map((b) => ({
        b,
        text: norm([b.name, b.tagline, b.description, b.address, b.city, b.zip, ...b.categories.map((c) => c.name)].filter(Boolean).join(" ")),
      })),
    [businesses],
  );

  const results = useMemo(() => {
    const terms = norm(deferred).split(/\s+/).filter(Boolean);
    return index
      .filter(({ b, text }) => (!town || b.city?.trim() === town) && terms.every((t) => text.includes(t)))
      .map(({ b }) => b);
  }, [index, deferred, town]);

  const filtered = query.trim() !== "" || town !== null;
  const clear = () => {
    setQuery("");
    setTown(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative lg:w-[22rem] lg:shrink-0">
          <label htmlFor={inputId} className="sr-only">
            Filter {categoryName.toLowerCase()}
          </label>
          <SearchIcon size={19} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-faint" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${categoryName.toLowerCase()} by name or street`}
            aria-describedby={statusId}
            autoComplete="off"
            className="field rounded-full pl-11"
          />
        </div>
        {towns.length > 1 && (
          <div className="no-scrollbar -mx-4 min-w-0 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:px-0" role="group" aria-label="Filter by town">
            <div className="flex w-max gap-2">
              <button
                type="button"
                aria-pressed={town === null}
                onClick={() => setTown(null)}
                className="min-h-11 rounded-full px-4 text-[0.92rem] font-medium shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--color-lake-700)] aria-pressed:bg-lake-700 aria-pressed:text-white aria-pressed:shadow-none"
              >
                All towns
              </button>
              {towns.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={town === name}
                  onClick={() => setTown(town === name ? null : name)}
                  className="min-h-11 rounded-full px-4 text-[0.92rem] font-medium shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--color-lake-700)] aria-pressed:bg-lake-700 aria-pressed:text-white aria-pressed:shadow-none"
                >
                  {name} <span className="tabular-nums opacity-70">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p id={statusId} role="status" className="mt-5 flex min-h-11 items-center gap-3 text-[0.95rem] text-ink-soft">
        {filtered ? (
          <>
            <span>
              Showing <strong className="font-semibold text-ink tabular-nums">{results.length}</strong> of {businesses.length}
            </span>
            <button
              type="button"
              onClick={clear}
              className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-medium text-lake-700 hover:bg-lake-50"
            >
              <CloseIcon size={15} /> Clear filters
            </button>
          </>
        ) : (
          <span>
            <strong className="font-semibold text-ink tabular-nums">{businesses.length}</strong> locally owned {businesses.length === 1 ? "listing" : "listings"}
          </span>
        )}
      </p>

      {results.length > 0 ? (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {results.map((b) => (
            <li key={b.slug}>
              <BusinessCard business={b} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-[var(--radius-card)] bg-paper p-8 text-center shadow-[0_0_0_1px_var(--color-line)]">
          <p className="font-display text-[1.5rem]">Nothing here matches “{query || town}”</p>
          <p className="mt-2 text-ink-soft">Try a shorter word, or search every category at once.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={clear} className="btn btn-ghost">
              Clear filters
            </button>
            <Link href={`/search?q=${encodeURIComponent(query)}`} className="btn btn-primary">
              Search all of Branson
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
