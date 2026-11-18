import type { Metadata } from "next";
import Link from "next/link";
import { home, site } from "@/content/site";
import { getAllBusinesses, getCategories, getFeaturedBusinesses } from "@/lib/queries";
import { graph, organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { BannerCarousel } from "@/components/site/banner-carousel";
import { FeaturedCard } from "@/components/site/business-card";
import { Contours } from "@/components/site/contours";
import { JsonLd } from "@/components/site/json-ld";
import { AdvertiseTile, SearchForm, TicketPanel } from "@/components/site/sections";
import { sortByNav } from "@/components/site/site-header";
import { ChevronRightIcon, FacebookIcon, GoogleIcon } from "@/components/ui/icons";

export const metadata: Metadata = pageMetadata({
  title: "Branson Local Businesses | Branson, Missouri Business Directory",
  absoluteTitle: true,
  description: site.description,
  path: "/",
});

export default async function HomePage() {
  const [categories, featured, all] = await Promise.all([getCategories(), getFeaturedBusinesses(), getAllBusinesses()]);
  const ordered = sortByNav(categories);
  const listed = all.length;

  return (
    <>
      <JsonLd data={graph(organizationJsonLd(), websiteJsonLd())} />

      {/* ───── Hero ───── */}
      <section className="on-dark relative isolate overflow-hidden bg-lake-900 text-white">
        <Contours className="absolute inset-0 -z-10 h-full w-full text-lake-700/70" />
        <div className="wrap grid gap-10 pt-14 pb-36 sm:pt-20 sm:pb-44 lg:grid-cols-12 lg:gap-12 lg:pt-24 lg:pb-52">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-2 text-[0.95rem] text-lake-200 motion-safe:animate-fade-in">
              <span className="inline-block size-2 rounded-full bg-sun" aria-hidden="true" />
              Branson, Missouri
            </p>
            <h1 className="type-hero mt-5 max-w-[11ch] motion-safe:animate-rise">{home.slogans[0]}.</h1>
          </div>
          <div className="flex flex-col justify-end gap-7 lg:col-span-5 lg:pb-3">
            <p className="max-w-[34rem] text-[1.08rem] leading-relaxed text-lake-100">{home.intro}</p>
            <SearchForm id="hero-q" tone="dark" />
          </div>
        </div>
      </section>

      {/* Front-page header banners, overlapping the hero edge */}
      <div className="wrap relative z-10 -mt-24 sm:-mt-32 lg:-mt-40">
        <BannerCarousel slides={home.slides} />
      </div>

      {/* ───── Category index ───── */}
      <section aria-labelledby="explore-h" className="wrap pt-16 sm:pt-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="explore-h" className="type-display max-w-[16ch]">
            Find your way around Branson
          </h2>
          <p className="max-w-sm text-ink-soft">
            {listed} listings from locally owned businesses, sorted the way visitors plan a trip.
          </p>
        </div>
        <ul className="mt-10 grid border-t border-line md:grid-cols-2 md:gap-x-10">
          {ordered.map((c) => {
            const empty = c.count === 0;
            return (
              <li key={c.slug} className="border-b border-line">
                <Link
                  href={`/${c.slug}`}
                  className="group -mx-3 flex min-h-[5.5rem] items-center gap-4 rounded-2xl px-3 py-4 transition-colors hover:bg-paper"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.55rem] leading-tight text-ink transition-colors group-hover:text-lake-700 sm:text-[1.8rem]">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-[0.95rem] text-ink-soft">{c.headline}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[0.85rem] font-medium tabular-nums ${
                      empty ? "bg-redbud-soft text-redbud-deep" : "bg-lake-50 text-lake-800"
                    }`}
                  >
                    {empty ? "Advertise here" : `${c.count} places`}
                  </span>
                  <ChevronRightIcon size={20} className="hidden shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-1 sm:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ───── Featured ───── */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-h" className="wrap pt-20 sm:pt-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="featured-h" className="type-display">
                Local favorites
              </h2>
              <p className="mt-3 max-w-lg text-ink-soft">Neighbors who keep the lights on along the Strip, downtown and out by the lake.</p>
            </div>
            <Link href="/advertise" className="btn btn-ghost self-start sm:self-auto">
              Feature your business
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {featured.map((b) => (
              <li key={b.id}>
                <FeaturedCard business={b} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───── Tickets ───── */}
      <section aria-labelledby="tickets-h" className="wrap pt-20 sm:pt-28">
        <h2 id="tickets-h" className="sr-only">
          Buy tickets to Branson shows and attractions
        </h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <TicketPanel kind="shows" />
          <TicketPanel kind="attractions" />
        </div>
      </section>

      {/* ───── Advertise ───── */}
      <section aria-labelledby="advertise-h" className="wrap pt-20 sm:pt-28">
        <div className="grid gap-10 rounded-[calc(var(--radius-tile)+0.5rem)] bg-lake-100 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14">
          <div className="lg:col-span-5">
            <h2 id="advertise-h" className="type-display">
              Advertise with us
            </h2>
            <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              Fishing guides, marinas, wedding chapels and event barns: these pages are waiting for their first local business. Listings start at
              $35 a year and link straight to your website.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/advertise" className="btn btn-accent">
                See advertising prices
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Contact us
              </Link>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
            {home.advertiseTiles.map((t, i) => (
              <li key={t.label}>
                <AdvertiseTile label={t.label} alt={t.alt} href={`/${t.slug}`} kind={(["fishing", "wedding", "venue"] as const)[i]} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Closing slogan + review ───── */}
      <section aria-labelledby="strong-h" className="wrap py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="strong-h" className="type-display lg:col-span-7">
            {home.slogans[1]}.
          </h2>
          <div className="lg:col-span-5">
            <p className="text-[1.05rem] leading-relaxed text-ink-soft">
              Found a new favorite through us? A quick Google review helps more visitors find Branson&apos;s local businesses.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={site.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <span className="grid size-6 place-items-center rounded-full bg-white">
                  <GoogleIcon size={15} />
                </span>
                Leave us a Google review
              </a>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <FacebookIcon size={18} /> Like us on Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
