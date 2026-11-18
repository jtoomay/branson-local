import type { Metadata } from "next";
import Link from "next/link";
import { advertise, site } from "@/content/site";
import { getFeaturedBusinesses } from "@/lib/queries";
import { breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import { BusinessMark } from "@/components/site/business-mark";
import { Contours } from "@/components/site/contours";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/sections";
import { CheckIcon, PhoneIcon } from "@/components/ui/icons";

export const metadata: Metadata = pageMetadata({
  title: "Advertise Your Business in Branson, MO | Listings from $35 a Year",
  absoluteTitle: true,
  description:
    "Advertise your Branson, Missouri business on Branson Local Businesses. Front-page headers, banners and category listings from $35 a year, all linking to your website.",
  path: "/advertise",
});

function Price({ value, light = false }: { value: number; light?: boolean }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className={`font-display text-[3.4rem] leading-none tracking-[-0.03em] ${light ? "text-white" : "text-ink"}`}>
        <span className="mr-0.5 align-top text-[1.6rem] leading-[1.6]">$</span>
        {value}
      </span>
      <span className={light ? "text-lake-200" : "text-ink-faint"}>per year</span>
    </p>
  );
}

export default async function AdvertisePage() {
  const featured = await getFeaturedBusinesses();
  const [hero, ...rest] = advertise.packages;

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Advertise", path: "/advertise" },
          ]),
          {
            "@type": "OfferCatalog",
            name: advertise.heading,
            itemListElement: advertise.packages.map((p) => ({
              "@type": "Offer",
              name: p.name,
              description: p.text,
              price: p.price,
              priceCurrency: "USD",
              seller: { "@type": "Organization", name: site.name },
            })),
          },
        )}
      />

      <header className="wrap pt-6 pb-12 sm:pt-8 sm:pb-16">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Advertise" }]} />
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="font-display text-[1.3rem] text-redbud">{advertise.heading}</p>
            <h1 className="type-display mt-2">Put your Branson business on the map</h1>
          </div>
          <p className="type-lede lg:col-span-5">{advertise.intro}</p>
        </div>
      </header>

      <section aria-labelledby="packages-h" className="wrap">
        <h2 id="packages-h" className="sr-only">
          Advertising packages
        </h2>

        {/* Signature package */}
        <div className="on-dark relative isolate grid gap-8 overflow-hidden rounded-[calc(var(--radius-tile)+0.5rem)] bg-lake-900 p-7 text-white sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-14">
          <Contours className="absolute inset-0 -z-10 h-full w-full text-lake-700/70" />
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-sun px-3 py-1 text-[0.85rem] font-semibold text-lake-950">Most visible</p>
            <h3 className="mt-4 font-display text-[2.2rem] leading-tight">{hero.name}</h3>
            <div className="mt-4">
              <Price value={hero.price} light />
            </div>
            <p className="mt-4 text-lake-100">{hero.text}</p>
            <p className="mt-2 text-lake-200">{hero.detail}</p>
            <Link href={`/contact?package=${hero.id}`} className="btn btn-sun mt-7">
              Reserve the front page
            </Link>
          </div>
          {/* A miniature of the home page, with the header slot highlighted */}
          <div aria-hidden="true" className="lg:col-span-7">
            <div className="rounded-2xl bg-mist p-3 shadow-[var(--shadow-float)] sm:p-4">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="size-2.5 rounded-full bg-line-strong" />
                <span className="size-2.5 rounded-full bg-line-strong" />
                <span className="size-2.5 rounded-full bg-line-strong" />
                <span className="ml-3 h-2.5 flex-1 rounded-full bg-line" />
              </div>
              <div className="rounded-xl bg-lake-900 p-4">
                <div className="h-3 w-2/3 rounded-full bg-white/80" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-white/80" />
              </div>
              <div className="relative -mt-2 mx-3 grid aspect-[4/1] place-items-center rounded-lg bg-sun text-center font-display text-[clamp(1rem,0.6rem+1.6vw,1.6rem)] text-lake-950 ring-4 ring-sun/40">
                Your banner here
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-md bg-paper shadow-[0_0_0_1px_var(--color-line)]" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((p) => (
            <li key={p.id} className="flex flex-col rounded-[var(--radius-tile)] bg-paper p-7 shadow-[0_0_0_1px_var(--color-line)]">
              <p className="text-[0.88rem] font-medium text-redbud">{p.placement}</p>
              <h3 className="mt-1 font-display text-[1.5rem] leading-tight">{p.name}</h3>
              <div className="mt-5">
                <Price value={p.price} />
              </div>
              <p className="mt-4 text-[0.98rem] text-ink-soft">{p.text}</p>
              <p className="mt-2 flex-1 text-[0.95rem] text-ink-faint">{p.detail}</p>
              <Link href={`/contact?package=${p.id}`} className="btn btn-ghost mt-6">
                Ask about this
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-8 flex flex-col gap-3 text-[1rem] text-ink-soft sm:flex-row sm:flex-wrap sm:gap-x-8">
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-moss" /> {advertise.note}
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-moss" /> {advertise.term}
          </li>
        </ul>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="advertisers-h" className="wrap pt-20 sm:pt-28">
          <h2 id="advertisers-h" className="type-title">
            In good company
          </h2>
          <p className="mt-2 max-w-lg text-ink-soft">A few of the local businesses already advertising with us.</p>
          <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
            {featured.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/business/${b.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[0_0_0_1.5px_var(--color-lake-700)]"
                >
                  <BusinessMark name={b.name} logoUrl={b.logo_url} fit="logo" sizes="160px" monogramSize={48} />
                  <span className="sr-only">{b.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="wrap py-20 sm:py-28">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-tile)] bg-redbud-soft p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="type-title">Ready to advertise?</h2>
            <p className="mt-2 max-w-lg text-ink-soft">Tell us about your business and where you&apos;d like to appear. We&apos;ll get back to you as soon as possible.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-accent">
              Contact us about advertising
            </Link>
            <a href={site.phoneHref} className="btn btn-ghost">
              <PhoneIcon size={18} /> {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
