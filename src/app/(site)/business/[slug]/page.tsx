import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBusinesses, getBusiness, getRelatedBusinesses } from "@/lib/queries";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  businessDescription,
  directionsUrl,
  formatAddress,
  graph,
  localBusinessJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { BusinessCard, displayText, markFit, prettyUrl, telHref } from "@/components/site/business-card";
import { BusinessMark } from "@/components/site/business-mark";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/sections";
import {
  ExternalIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  LinkIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  PlayIcon,
} from "@/components/ui/icons";

type Props = { params: Promise<{ slug: string }> };

// Every known slug is prerendered via generateStaticParams (data cached for an hour via 'use cache').
// Params are awaited outside <Suspense> on purpose: an unknown or unpublished slug must block and
// return a real 404 status (good for SEO) instead of streaming a soft 404 into a 200 shell.
export const instant = false;

export async function generateStaticParams() {
  const all = await getAllBusinesses();
  return all.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusiness(slug);
  if (!b) return { title: "Business not found", robots: { index: false } };
  const where = b.city && b.city !== "Branson" ? `${b.city}, ${b.state ?? "MO"}` : "Branson, MO";
  const image = b.logo_url ? (b.logo_url.startsWith("http") ? b.logo_url : absoluteUrl(b.logo_url)) : undefined;
  return pageMetadata({
    title: `${b.name} | ${b.categories[0]?.name ?? "Local business"} in ${where}`,
    description: businessDescription(b),
    path: `/business/${b.slug}`,
    ...(image ? { images: [{ url: image, alt: `${b.name} logo` }] } : {}),
  });
}

function isVideo(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;
  const [b, related] = await Promise.all([getBusiness(slug), getRelatedBusinesses(slug, 6)]);
  if (!b) notFound();

  const primary = b.categories[0];
  const directions = directionsUrl(b);
  const address = formatAddress(b);
  const fit = markFit(b);
  const isPhoto = Boolean(b.logo_url) && fit === "photo";
  const paragraphs = (b.description ?? "").split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);

  const crumbs = [
    { name: "Home", path: "/" },
    ...(primary ? [{ name: primary.name, path: `/${primary.slug}` }] : []),
    { name: b.name, path: `/business/${b.slug}` },
  ];

  return (
    <>
      <JsonLd data={graph(localBusinessJsonLd(b), breadcrumbJsonLd(crumbs))} />

      <div className="wrap pt-6 sm:pt-8">
        <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : { name: c.name, href: c.path }))} />
      </div>

      <article className="wrap grid gap-10 pt-8 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7 xl:col-span-8">
          {isPhoto ? (
            <div className="relative mb-8 aspect-[3/2] overflow-hidden rounded-[var(--radius-tile)] shadow-[var(--shadow-lift)]">
              <BusinessMark name={b.name} logoUrl={b.logo_url} fit="photo" sizes="(min-width: 1024px) 720px, 100vw" preload />
            </div>
          ) : (
            <div
              className={`relative mb-7 overflow-hidden ${
                b.logo_url ? "h-28 w-44 rounded-[var(--radius-card)] shadow-[0_0_0_1px_var(--color-line)]" : "size-24 rounded-full"
              }`}
            >
              <BusinessMark name={b.name} logoUrl={b.logo_url} fit="logo" sizes="176px" monogramSize={96} preload className={b.logo_url ? "" : "bg-transparent"} />
            </div>
          )}

          {b.categories.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Listed in">
              {b.categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/${c.slug}`}
                    className="inline-flex min-h-9 items-center rounded-full bg-redbud-soft px-3.5 text-[0.88rem] font-medium text-redbud-deep transition-colors hover:bg-redbud hover:text-white"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h1 className="type-display mt-4">{b.name}</h1>
          {b.tagline && <p className="type-lede mt-3">{displayText(b.tagline)}</p>}

          <div className="mt-7 flex flex-wrap gap-3">
            {b.phone && (
              <a href={telHref(b.phone)} className="btn btn-primary">
                <PhoneIcon size={18} /> Call {b.phone}
              </a>
            )}
            {directions && (
              <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <PinIcon size={18} /> Directions
              </a>
            )}
            {b.website && (
              <a href={b.website} target="_blank" rel="noopener" className="btn btn-ghost">
                <GlobeIcon size={18} /> Visit website
              </a>
            )}
          </div>

          {paragraphs.length > 0 && (
            <div className="prose-local mt-10 max-w-[42rem] text-[1.08rem] leading-[1.75] text-ink">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {b.extra_links.length > 0 && (
            <section aria-labelledby="links-h" className="mt-10 max-w-[42rem]">
              <h2 id="links-h" className="font-sans text-[1rem] font-semibold text-ink">
                More from {b.name}
              </h2>
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] bg-paper shadow-[0_0_0_1px_var(--color-line)]">
                {b.extra_links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener"
                      className="flex min-h-14 items-center gap-3 px-5 py-3 transition-colors hover:bg-lake-50"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lake-50 text-lake-700">
                        {isVideo(l.url) ? <PlayIcon size={18} /> : <LinkIcon size={18} />}
                      </span>
                      <span className="flex-1 font-medium">{l.label}</span>
                      <ExternalIcon size={17} className="text-ink-faint" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="rounded-[var(--radius-tile)] bg-paper p-6 shadow-[0_0_0_1px_var(--color-line)] sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <h2 className="font-display text-[1.5rem]">Plan your visit</h2>
            <dl className="mt-5 space-y-5 text-[0.98rem]">
              {address && (
                <div className="flex gap-3">
                  <dt className="mt-0.5 text-lake-700">
                    <PinIcon size={20} />
                    <span className="sr-only">Address</span>
                  </dt>
                  <dd>
                    <address className="not-italic">{address}</address>
                    {directions && (
                      <a href={directions} target="_blank" rel="noopener noreferrer" className="link-underline mt-1 inline-flex min-h-8 items-center text-lake-700">
                        Get directions
                      </a>
                    )}
                  </dd>
                </div>
              )}
              {b.phone && (
                <div className="flex gap-3">
                  <dt className="mt-0.5 text-lake-700">
                    <PhoneIcon size={20} />
                    <span className="sr-only">Phone</span>
                  </dt>
                  <dd>
                    <a href={telHref(b.phone)} className="link-underline inline-flex min-h-8 items-center">
                      {b.phone}
                    </a>
                  </dd>
                </div>
              )}
              {b.email && (
                <div className="flex gap-3">
                  <dt className="mt-0.5 text-lake-700">
                    <MailIcon size={20} />
                    <span className="sr-only">Email</span>
                  </dt>
                  <dd className="min-w-0">
                    <a href={`mailto:${b.email}`} className="link-underline inline-flex min-h-8 items-center break-all">
                      {b.email}
                    </a>
                  </dd>
                </div>
              )}
              {b.website && (
                <div className="flex gap-3">
                  <dt className="mt-0.5 text-lake-700">
                    <GlobeIcon size={20} />
                    <span className="sr-only">Website</span>
                  </dt>
                  <dd className="min-w-0">
                    <a href={b.website} target="_blank" rel="noopener" className="link-underline inline-flex min-h-8 items-center break-all">
                      {prettyUrl(b.website)}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {(b.facebook || b.instagram) && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
                {b.facebook && (
                  <a href={b.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-11 px-4">
                    <FacebookIcon size={18} /> Facebook
                  </a>
                )}
                {b.instagram && (
                  <a href={b.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-11 px-4">
                    <InstagramIcon size={18} /> Instagram
                  </a>
                )}
              </div>
            )}

            <p className="mt-6 border-t border-line pt-5 text-[0.9rem] text-ink-faint">
              Is this your business?{" "}
              <Link href="/contact" className="link-underline text-lake-700">
                Update your listing
              </Link>
            </p>
          </div>
        </aside>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="wrap pb-20 sm:pb-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="related-h" className="type-title">
              {primary ? `More ${primary.name.toLowerCase()} nearby` : "More local businesses"}
            </h2>
            {primary && (
              <Link href={`/${primary.slug}`} className="link-underline inline-flex min-h-11 items-center font-medium text-lake-700">
                See all {primary.name.toLowerCase()}
              </Link>
            )}
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {related.map((r) => (
              <li key={r.id}>
                <BusinessCard business={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
