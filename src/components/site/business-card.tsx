import Link from "next/link";
import type { BusinessWithCategories } from "@/lib/database.types";
import { directionsUrl } from "@/lib/seo";
import { BusinessMark } from "./business-mark";
import { FacebookIcon, GlobeIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";

export type CardBusiness = Pick<
  BusinessWithCategories,
  | "slug"
  | "name"
  | "tagline"
  | "description"
  | "address"
  | "city"
  | "state"
  | "zip"
  | "phone"
  | "website"
  | "facebook"
  | "maps_url"
  | "logo_url"
  | "categories"
> & { featured?: boolean };

/** Hotel listings carry property photos (crop to fill); sponsors and everyone else carry logos (contain). */
export function markFit(b: Pick<BusinessWithCategories, "logo_url" | "categories"> & { featured?: boolean }): "logo" | "photo" {
  if (/photo/.test(b.logo_url ?? "")) return "photo";
  return b.categories.some((c) => c.slug === "hotels") && !b.featured ? "photo" : "logo";
}

/** Legacy taglines are often ALL CAPS; set them in sentence case so they read as copy, not shouting. */
export function displayText(text: string | null | undefined) {
  if (!text) return text ?? null;
  const letters = text.replace(/[^a-z]/gi, "");
  if (letters.length < 4 || letters !== letters.toUpperCase()) return text;
  const lower = text.toLowerCase();
  return lower.replace(/(^|[.!?]\s+)([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());
}

export function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+1${digits.replace(/^1(?=\d{10}$)/, "")}`}`;
}

/** Strip the scheme and trailing slash for display. */
export function prettyUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/**
 * Directory listing card. The whole card links to the detail page (stretched link on the name);
 * the quick actions sit above it so call/directions/website stay one tap away.
 */
export function BusinessCard({ business: b, showCategory = false }: { business: CardBusiness; showCategory?: boolean }) {
  const directions = directionsUrl(b);
  const hasLogo = Boolean(b.logo_url);
  const blurb = displayText(b.tagline) ?? (b.description ? b.description : null);

  return (
    <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] bg-paper shadow-[0_0_0_1px_var(--color-line)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_var(--color-line-strong),var(--shadow-lift)]">
      <div className="flex gap-4 p-5 pb-4">
        <div
          className={`relative shrink-0 overflow-hidden ${hasLogo ? "h-16 w-20 rounded-xl shadow-[0_0_0_1px_var(--color-line)]" : "h-16 w-16 rounded-full"}`}
        >
          <BusinessMark name={b.name} logoUrl={b.logo_url} fit={markFit(b)} sizes="80px" monogramSize={64} className={hasLogo ? "" : "bg-transparent"} />
        </div>
        <div className="min-w-0 flex-1">
          {showCategory && b.categories[0] && (
            <p className="mb-1 text-[0.8rem] font-medium text-redbud">{b.categories.map((c) => c.name).join(", ")}</p>
          )}
          <h3 className="text-[1.22rem] leading-snug text-ink">
            <Link
              href={`/business/${b.slug}`}
              className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-redbud"
            >
              {b.name}
            </Link>
          </h3>
          {blurb && <p className="mt-1 line-clamp-2 text-[0.95rem] leading-relaxed text-ink-soft">{blurb}</p>}
          {(b.address || b.city) && (
            <p className="mt-2 flex items-start gap-1.5 text-[0.9rem] text-ink-faint">
              <PinIcon size={16} className="mt-[0.2rem] shrink-0" />
              <span>{[b.address, b.city].filter(Boolean).join(", ")}</span>
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-1 border-t border-line px-3 py-2">
        {b.phone && (
          <a
            href={telHref(b.phone)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.92rem] font-semibold text-lake-700 transition-colors hover:bg-lake-50"
          >
            <PhoneIcon size={17} />
            <span>{b.phone}</span>
          </a>
        )}
        <span className="ml-auto flex items-center">
          {directions && (
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lake-50 hover:text-lake-700"
            >
              <PinIcon size={19} />
              <span className="sr-only">Directions to {b.name} (opens Google Maps)</span>
            </a>
          )}
          {b.website && (
            <a
              href={b.website}
              target="_blank"
              rel="noopener"
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lake-50 hover:text-lake-700"
            >
              <GlobeIcon size={19} />
              <span className="sr-only">{b.name} website (opens in a new tab)</span>
            </a>
          )}
          {b.facebook && (
            <a
              href={b.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lake-50 hover:text-lake-700"
            >
              <FacebookIcon size={19} />
              <span className="sr-only">{b.name} on Facebook (opens in a new tab)</span>
            </a>
          )}
        </span>
      </div>
    </article>
  );
}

/** Home-page "local favorites" card: the sponsor's logo gets the stage. */
export function FeaturedCard({ business: b }: { business: CardBusiness }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-[0_0_0_1px_var(--color-line)] transition-shadow duration-300 group-hover:shadow-[0_0_0_1px_var(--color-line-strong),var(--shadow-lift)]">
        <BusinessMark
          name={b.name}
          logoUrl={b.logo_url}
          fit={markFit(b)}
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
          monogramSize={88}
          className="transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 px-0.5">
        <p className="text-[0.8rem] font-medium text-redbud">{b.categories.map((c) => c.name).join(", ")}</p>
        <h3 className="mt-0.5 text-[1.15rem] leading-snug sm:text-[1.25rem]">
          <Link
            href={`/business/${b.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[var(--radius-card)] focus-visible:after:outline-3 focus-visible:after:outline-offset-4 focus-visible:after:outline-redbud"
          >
            {b.name}
          </Link>
        </h3>
        {b.tagline && <p className="mt-1 line-clamp-2 text-[0.92rem] text-ink-soft">{displayText(b.tagline)}</p>}
      </div>
    </article>
  );
}
