import Link from "next/link";
import { tickets } from "@/content/site";
import { ChevronRightIcon, ExternalIcon, MegaphoneIcon, SearchIcon, TicketIcon } from "@/components/ui/icons";
import { Contours } from "./contours";

/* ───────── Search ───────── */

export function SearchForm({
  defaultValue,
  id = "q",
  tone = "light",
  placeholder = "Search BBQ, lake resorts, fudge, gospel…",
  autoFocus,
}: {
  defaultValue?: string;
  id?: string;
  tone?: "light" | "dark";
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <form action="/search" role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search Branson businesses
      </label>
      <SearchIcon
        size={20}
        className={`pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 ${dark ? "text-lake-200" : "text-ink-faint"}`}
      />
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className={`h-14 w-full rounded-full pr-32 pl-13 text-[1.02rem] transition-[box-shadow,background-color] focus:outline-none ${
          dark
            ? "bg-white/10 text-white shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.22)] placeholder:text-lake-200 focus:bg-white/14 focus:shadow-[inset_0_0_0_2px_var(--color-sun)]"
            : "bg-paper text-ink shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] placeholder:text-ink-faint focus:shadow-[inset_0_0_0_2px_var(--color-lake-700),0_0_0_5px_rgb(21_93_107/0.14)]"
        }`}
      />
      <button type="submit" className={`btn absolute top-1 right-1 h-12 min-h-0 px-5 ${dark ? "btn-sun" : "btn-primary"}`}>
        Search
      </button>
    </form>
  );
}

/* ───────── Breadcrumbs ───────── */

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[0.9rem]">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-ink-faint">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1">
            {i > 0 && <ChevronRightIcon size={14} className="text-line-strong" />}
            {item.href ? (
              <Link href={item.href} className="link-underline inline-flex min-h-8 items-center hover:text-ink">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-soft">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ───────── Tickets ───────── */

export function TicketPanel({ kind, compact = false }: { kind: keyof typeof tickets; compact?: boolean }) {
  const t = tickets[kind];
  const isShows = kind === "shows";
  return (
    <a
      href={t.url}
      target="_blank"
      rel="noopener"
      className={`group on-dark relative isolate flex h-full flex-col overflow-hidden rounded-[var(--radius-tile)] p-7 text-white sm:p-9 ${
        isShows ? "bg-lake-900" : "bg-redbud-deep"
      } ${compact ? "min-h-0" : "min-h-[19rem]"}`}
    >
      <Contours className={`absolute inset-0 -z-10 h-full w-full ${isShows ? "text-lake-700" : "text-redbud"}`} />
      <span className="flex items-center gap-2 text-[0.92rem] font-medium text-sun">
        <TicketIcon size={20} />
        {isShows ? "Branson shows" : "Branson attractions"}
      </span>
      <span className={`mt-4 block font-display ${compact ? "text-[1.7rem]" : "text-[clamp(1.9rem,1.4rem+1.6vw,2.7rem)]"} leading-[1.05]`}>
        {t.title}
      </span>
      <span className="mt-3 block max-w-md text-[1rem] leading-relaxed text-white/80">{t.body}</span>
      <span className="btn btn-sun mt-auto self-start group-hover:bg-[#f6c56b]">
        {t.cta}
        <ExternalIcon size={17} />
      </span>
      <span className="sr-only"> (opens the ticket store in a new tab)</span>
    </a>
  );
}

/* ───────── Advertise tiles (empty categories) ───────── */

function TileArt({ kind }: { kind: "fishing" | "wedding" | "venue" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-auto text-sun" aria-hidden="true">
      {kind === "fishing" && (
        <g {...common}>
          <path d="M8 22c22-14 52-16 78 6" />
          <path d="M86 28v24" strokeDasharray="2 3" />
          <path d="M80 52a6 6 0 1 0 12 0 6 6 0 0 0-12 0Z" />
          <path d="M80 52h12" />
          <path d="M14 66c8-4 14-4 22 0s14 4 22 0 14-4 22 0 14 4 22 0" />
          <path d="M28 74c6-3 11-3 17 0s11 3 17 0 11-3 17 0" opacity=".6" />
        </g>
      )}
      {kind === "wedding" && (
        <g {...common}>
          <circle cx="48" cy="46" r="18" />
          <circle cx="72" cy="46" r="18" />
          <path d="M66 22l6-8 6 8-6 5Z" />
          <path d="M20 16l2 4 4 1-4 2-2 4-2-4-4-2 4-1Z" opacity=".7" />
          <path d="M100 60l1.5 3 3 1-3 1.5-1.5 3-1.5-3-3-1.5 3-1Z" opacity=".7" />
        </g>
      )}
      {kind === "venue" && (
        <g {...common}>
          <path d="M14 72V40l46-26 46 26v32" />
          <path d="M8 44l52-30 52 30" />
          <path d="M44 72V50h32v22" />
          <path d="M60 50v22M44 61h32" opacity=".7" />
          <path d="M53 34h14" />
          <path d="M4 72h112" />
        </g>
      )}
    </svg>
  );
}

export function AdvertiseTile({ label, alt, kind, href }: { label: string; alt: string; kind: "fishing" | "wedding" | "venue"; href: string }) {
  return (
    <Link
      href={href}
      className="group on-dark relative isolate flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-[var(--radius-tile)] bg-lake-900 p-6 text-white transition-[background-color] duration-300 hover:bg-lake-800"
    >
      <Contours className="absolute inset-0 -z-10 h-full w-full text-lake-800 transition-colors duration-500 group-hover:text-lake-700" />
      <TileArt kind={kind} />
      <span>
        <span className="block font-display text-[1.75rem] leading-tight">{label}</span>
        <span className="mt-1 flex items-center gap-1.5 text-[0.95rem] text-lake-200 group-hover:text-white">
          Advertise here
          <ChevronRightIcon size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
        <span className="sr-only">{alt}</span>
      </span>
    </Link>
  );
}

/* ───────── Empty category: advertise here ───────── */

export function AdvertiseEmptyState({ categoryName }: { categoryName: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-[var(--radius-tile)] bg-paper p-8 shadow-[0_0_0_1px_var(--color-line)] sm:p-12">
      <Contours className="absolute inset-0 -z-10 h-full w-full text-lake-100" />
      <span className="grid size-14 place-items-center rounded-full bg-redbud-soft text-redbud">
        <MegaphoneIcon size={26} />
      </span>
      <h2 className="type-title mt-6 max-w-xl">This page is open for the first {categoryName.toLowerCase()} listing</h2>
      <p className="mt-3 max-w-xl text-ink-soft">
        Visitors planning a Branson trip look here first. Put your business in front of them with a listing from $35 a year, or claim the
        whole page with a banner.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/advertise" className="btn btn-accent">
          See advertising prices
        </Link>
        <Link href="/contact" className="btn btn-ghost">
          Ask about this page
        </Link>
      </div>
    </div>
  );
}
