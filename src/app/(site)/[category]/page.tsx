import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryPageCopy, categoryTickets } from "@/content/site";
import { getBusinessesByCategory, getCategories, getCategory } from "@/lib/queries";
import { breadcrumbJsonLd, graph, itemListJsonLd, pageMetadata } from "@/lib/seo";
import type { CardBusiness } from "@/components/site/business-card";
import { JsonLd } from "@/components/site/json-ld";
import { ListingExplorer } from "@/components/site/listing-explorer";
import { AdvertiseEmptyState, Breadcrumbs, TicketPanel } from "@/components/site/sections";
import { sortByNav } from "@/components/site/site-header";
import { MegaphoneIcon } from "@/components/ui/icons";

type Props = { params: Promise<{ category: string }> };

// Every known slug is prerendered via generateStaticParams (data cached for an hour via 'use cache').
// Params are awaited outside <Suspense> on purpose: an unknown or unpublished slug must block and
// return a real 404 status (good for SEO) instead of streaming a soft 404 into a 200 shell.
export const instant = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: category.seo_title ?? `${category.name} in Branson, MO`,
    absoluteTitle: Boolean(category.seo_title),
    description: category.seo_description ?? category.description ?? `${category.name} in Branson, Missouri.`,
    path: `/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const [category, businesses, categories] = await Promise.all([getCategory(slug), getBusinessesByCategory(slug), getCategories()]);
  if (!category) notFound();

  const copy = categoryPageCopy[category.slug];
  const h1 = copy?.h1 ?? `${category.name} in Branson, Missouri`;
  const ticket = categoryTickets[category.slug];
  const others = sortByNav(categories).filter((c) => c.slug !== category.slug);

  // Trim what ships to the client filter: everything the card shows, nothing more.
  const cards: CardBusiness[] = businesses.map((b) => ({
    slug: b.slug,
    name: b.name,
    tagline: b.tagline,
    description: b.description ? b.description.slice(0, 220) : null,
    address: b.address,
    city: b.city,
    state: b.state,
    zip: b.zip,
    phone: b.phone,
    website: b.website,
    facebook: b.facebook,
    maps_url: b.maps_url,
    logo_url: b.logo_url,
    categories: b.categories,
    featured: b.featured,
  }));

  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: category.name, path: `/${category.slug}` },
          ]),
          ...(businesses.length ? [itemListJsonLd(h1, businesses)] : []),
        )}
      />

      <header className="wrap pt-6 pb-10 sm:pt-8 sm:pb-14">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: category.name }]} />
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p className="font-display text-[1.25rem] text-redbud sm:text-[1.4rem]">{category.headline}</p>
            <h1 className="type-display mt-2">{h1}</h1>
          </div>
          <div className="lg:col-span-5">
            {category.description && <p className="type-lede">{category.description}</p>}
          </div>
        </div>
        {copy?.intro && (
          <p className="mt-8 max-w-3xl border-l-2 border-sun pl-5 text-[1.05rem] leading-relaxed text-ink-soft">{copy.intro}</p>
        )}
      </header>

      {ticket && (
        <div className="wrap pb-10">
          <TicketPanel kind={ticket} compact />
        </div>
      )}

      <section aria-label={`${category.name} listings`} className="wrap pb-16 sm:pb-24">
        {cards.length > 0 ? <ListingExplorer businesses={cards} categoryName={category.name} /> : <AdvertiseEmptyState categoryName={category.name} />}
      </section>

      {cards.length > 0 && (
        <aside className="wrap pb-16 sm:pb-24">
          <div className="flex flex-col gap-5 rounded-[var(--radius-tile)] bg-lake-100 p-7 sm:flex-row sm:items-center sm:p-9">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper text-redbud">
              <MegaphoneIcon size={24} />
            </span>
            <div className="flex-1">
              <p className="font-display text-[1.45rem] leading-tight">Own one of Branson&apos;s {category.name.toLowerCase()}?</p>
              <p className="mt-1 text-ink-soft">Add your listing from $35 a year, or put a banner at the top of this page.</p>
            </div>
            <Link href="/advertise" className="btn btn-accent self-start sm:self-auto">
              Advertise here
            </Link>
          </div>
        </aside>
      )}

      <nav aria-labelledby="more-h" className="wrap pb-20 sm:pb-28">
        <h2 id="more-h" className="type-title">
          Keep exploring
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${c.slug}`}
                className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-[0.95rem] font-medium shadow-[0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[0_0_0_1.5px_var(--color-lake-700)]"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
