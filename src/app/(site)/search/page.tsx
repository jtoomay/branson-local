import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories, searchBusinesses } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { BusinessCard } from "@/components/site/business-card";
import { Breadcrumbs, SearchForm } from "@/components/site/sections";
import { sortByNav } from "@/components/site/site-header";

export const metadata: Metadata = pageMetadata({
  title: "Search Branson businesses",
  description: "Search every locally owned restaurant, hotel, show, shop and service listed on Branson Local Businesses.",
  path: "/search",
  noindex: true,
});

const suggestions = ["BBQ", "Pizza", "Fudge", "Resort", "Gospel", "Antiques", "Escape room", "Hollister"];

type Props = { searchParams: Promise<{ q?: string | string[] }> };

async function Results({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 100) ?? "";
  const [results, categories] = await Promise.all([q ? searchBusinesses(q) : Promise.resolve([]), getCategories()]);

  return (
    <>
      <div className="mt-8 max-w-2xl">
        <SearchForm defaultValue={q} id="search-page-q" autoFocus={!q} />
      </div>

      {q ? (
        <p role="status" className="mt-8 text-[1.05rem] text-ink-soft">
          {results.length > 0 ? (
            <>
              <strong className="font-semibold text-ink tabular-nums">{results.length}</strong> {results.length === 1 ? "business matches" : "businesses match"}{" "}
              <span className="text-ink">“{q}”</span>
            </>
          ) : (
            <>
              Nothing matches <span className="text-ink">“{q}”</span>. Try a shorter word or one of the ideas below.
            </>
          )}
        </p>
      ) : (
        <p className="mt-8 text-[1.05rem] text-ink-soft">Search by business name, food, street or town.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {results.map((b) => (
            <li key={b.id}>
              <BusinessCard business={b} showCategory />
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-sans text-[1rem] font-semibold">Popular searches</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <Link
                    href={`/search?q=${encodeURIComponent(s)}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 font-medium shadow-[0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[0_0_0_1.5px_var(--color-lake-700)]"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-[1rem] font-semibold">Browse by category</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sortByNav(categories).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-lake-50 px-4 font-medium text-lake-800 transition-colors hover:bg-lake-100"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default function SearchPage(props: Props) {
  return (
    <div className="wrap pt-6 pb-20 sm:pt-8 sm:pb-28">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Search" }]} />
      <h1 className="type-display mt-8">Search Branson businesses</h1>
      <Suspense
        fallback={
          <div className="mt-8 max-w-2xl">
            <SearchForm id="search-page-q" />
          </div>
        }
      >
        <Results searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
