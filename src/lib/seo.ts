import type { Metadata } from "next";
import type { BusinessWithCategories } from "@/lib/database.types";
import { site } from "@/content/site";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bransonlocalbusinesses.com").replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title?: string;
  /** Use the title verbatim instead of the "%s | Branson Local Businesses" template. */
  absoluteTitle?: boolean;
  description: string;
  path: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noindex?: boolean;
  type?: "website" | "article";
};

/** Builds consistent title/description/canonical/OpenGraph/Twitter metadata for a route. */
/** The generated site-wide card (src/app/opengraph-image.tsx). A page's own `openGraph` replaces the
 * inherited file-based image, so it has to be set explicitly as the fallback. */
const defaultOgImage = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: "Branson Local Businesses: we bring Branson business to one place",
};

export function pageMetadata({ title, absoluteTitle, description, path, images = [defaultOgImage], noindex, type = "website" }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title ? (absoluteTitle ? title : `${title} | ${site.name}`) : site.defaultTitle;
  return {
    title: title ? (absoluteTitle ? { absolute: title } : title) : { absolute: site.defaultTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: site.name,
      title: fullTitle,
      description,
      locale: "en_US",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function truncate(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

export function formatAddress(b: Pick<BusinessWithCategories, "address" | "city" | "state" | "zip">) {
  const line2 = [b.city, [b.state, b.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return [b.address, line2].filter(Boolean).join(", ");
}

export function directionsUrl(b: Pick<BusinessWithCategories, "maps_url" | "name" | "address" | "city" | "state" | "zip">) {
  if (b.maps_url) return b.maps_url;
  if (!b.address && !b.city) return null;
  const q = [b.name, formatAddress(b)].join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function businessDescription(b: BusinessWithCategories) {
  if (b.description) return truncate(b.description);
  const cats = b.categories.map((c) => c.name.toLowerCase()).join(" and ");
  const where = b.city ? `${b.city}, ${b.state ?? "MO"}` : "Branson, MO";
  const bits = [
    `${b.name}${b.tagline ? `, ${b.tagline.replace(/\.$/, "")}` : ""} is a locally owned business in ${where}${cats ? ` listed under ${cats}` : ""}.`,
    b.address ? `Find it at ${formatAddress(b)}.` : "",
    b.phone ? `Call ${b.phone}.` : "",
  ];
  return truncate(bits.filter(Boolean).join(" "));
}

/* ───────────── JSON-LD ───────────── */

type Json = Record<string, unknown>;

export function organizationJsonLd(): Json {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.svg"),
    telephone: site.phoneE164,
    areaServed: { "@type": "City", name: "Branson", containedInPlace: { "@type": "State", name: "Missouri" } },
    sameAs: [site.social.facebook, site.social.instagram],
  };
}

export function websiteJsonLd(): Json {
  return {
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: site.name,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(name: string, businesses: BusinessWithCategories[]): Json {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: businesses.length,
    itemListElement: businesses.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/business/${b.slug}`),
      name: b.name,
    })),
  };
}

const typeByCategory: Record<string, string> = {
  restaurants: "Restaurant",
  hotels: "LodgingBusiness",
  shows: "PerformingArtsTheater",
  shopping: "Store",
  "specialty-shops": "Store",
  "things-to-do": "TouristAttraction",
  "day-trips": "TouristAttraction",
  "fishing-boating": "SportsActivityLocation",
  "wedding-venues": "EventVenue",
  "veteran-services": "LocalBusiness",
};

export function schemaTypeFor(b: BusinessWithCategories) {
  const primary = b.categories[0]?.slug;
  const name = b.name.toLowerCase();
  if (primary === "hotels") {
    if (/\b(rv|campground)\b/.test(name)) return "Campground";
    if (/\b(resort|marina)\b/.test(name)) return "Resort";
    if (/\b(inn|hotel)\b/.test(name)) return "Hotel";
  }
  return (primary && typeByCategory[primary]) || "LocalBusiness";
}

export function localBusinessJsonLd(b: BusinessWithCategories): Json {
  const sameAs = [b.facebook, b.instagram].filter(Boolean);
  const image = b.logo_url ? (b.logo_url.startsWith("http") ? b.logo_url : absoluteUrl(b.logo_url)) : undefined;
  return {
    "@type": schemaTypeFor(b),
    "@id": absoluteUrl(`/business/${b.slug}#business`),
    name: b.name,
    url: absoluteUrl(`/business/${b.slug}`),
    ...(b.description || b.tagline ? { description: b.description ?? b.tagline } : {}),
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.email ? { email: b.email } : {}),
    ...(image ? { image, logo: image } : {}),
    ...(b.website ? { sameAs: [b.website, ...sameAs] } : sameAs.length ? { sameAs } : {}),
    ...(b.address || b.city
      ? {
          address: {
            "@type": "PostalAddress",
            ...(b.address ? { streetAddress: b.address } : {}),
            ...(b.city ? { addressLocality: b.city } : {}),
            addressRegion: b.state ?? "MO",
            ...(b.zip ? { postalCode: b.zip } : {}),
            addressCountry: "US",
          },
        }
      : {}),
    ...(directionsUrl(b) ? { hasMap: directionsUrl(b) } : {}),
  };
}

/** Wraps nodes into a single @graph document. */
export function graph(...nodes: Json[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
