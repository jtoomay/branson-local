"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  CompassIcon,
  HomeIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  StarIcon,
} from "@/components/ui/icons";
import { Wordmark } from "./wordmark";

export type NavCategory = { slug: string; name: string; headline: string | null; count: number };

type Props = {
  categories: NavCategory[];
  primary: string[];
  phone: string;
  phoneHref: string;
  reviewUrl: string;
};

export function SiteHeaderClient({ categories, primary, phone, phoneHref, reviewUrl }: Props) {
  const pathname = usePathname();
  const [explore, setExplore] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const panelId = useId();
  const sheetId = useId();
  const exploreBtn = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetClose = useRef<HTMLButtonElement>(null);

  // Close menus on navigation (state adjustment during render, no effect needed).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setExplore(false);
    setSheet(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = useCallback(() => {
    setExplore(false);
    setSheet(false);
  }, []);

  useEffect(() => {
    if (!explore && !sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (explore) exploreBtn.current?.focus();
        closeAll();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!explore) return;
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || exploreBtn.current?.contains(t)) return;
      setExplore(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [explore, sheet, closeAll]);

  // Close the explore panel when keyboard focus moves outside it.
  useEffect(() => {
    if (!explore) return;
    const onFocus = (e: FocusEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || exploreBtn.current?.contains(t)) return;
      setExplore(false);
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [explore]);

  useEffect(() => {
    if (!sheet) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    sheetClose.current?.focus();
    // Keep Tab inside the modal sheet.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = document.getElementById(sheetId);
      const items = root ? [...root.querySelectorAll<HTMLElement>("a[href], button, input")] : [];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      if (opener?.isConnected) opener.focus();
    };
  }, [sheet, sheetId]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const primaryCats = primary.map((slug) => categories.find((c) => c.slug === slug)).filter((c): c is NavCategory => Boolean(c));

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
          scrolled || explore ? "bg-mist/92 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-mist"
        }`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        <div className="wrap flex h-[var(--header-h)] items-center gap-3">
          <Link href="/" className="-ml-1 flex min-h-11 items-center rounded-lg px-1" aria-label="Branson Local Businesses, home">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-0.5 lg:flex">
            {primaryCats.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                aria-current={isActive(`/${c.slug}`) ? "page" : undefined}
                className="relative inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-lake-700 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3.5 aria-[current=page]:after:bottom-1.5 aria-[current=page]:after:h-0.5 aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-redbud"
              >
                {c.name.replace(" & Lodging", "")}
              </Link>
            ))}
            <button
              ref={exploreBtn}
              type="button"
              aria-expanded={explore}
              aria-controls={panelId}
              onClick={() => setExplore((v) => !v)}
              onKeyDown={(e) => {
                // The panel sits later in the DOM; move Tab straight into it.
                if (e.key === "Tab" && !e.shiftKey && explore) {
                  const first = panelRef.current?.querySelector<HTMLElement>("a[href]");
                  if (first) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-full px-3.5 text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink aria-expanded:bg-lake-50 aria-expanded:text-lake-800"
            >
              Explore all
              <ChevronDownIcon size={16} className={`transition-transform duration-300 ${explore ? "rotate-180" : ""}`} />
            </button>
            <Link
              href="/search"
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lake-50 hover:text-ink"
            >
              <SearchIcon />
              <span className="sr-only">Search the directory</span>
            </Link>
          </nav>

          <a href={phoneHref} className="btn btn-primary ml-auto hidden px-4 sm:inline-flex lg:ml-2">
            <PhoneIcon size={17} />
            <span>
              <span className="sr-only lg:not-sr-only">Call </span>
              {phone}
            </span>
          </a>

          <button
            type="button"
            className="ml-auto grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-lake-50 sm:ml-1 lg:hidden"
            aria-expanded={sheet}
            aria-controls={sheetId}
            onClick={() => setSheet(true)}
          >
            <MenuIcon size={24} />
            <span className="sr-only">Open menu</span>
          </button>
        </div>

        {/* Desktop explore panel */}
        <div
          id={panelId}
          ref={panelRef}
          hidden={!explore}
          className="absolute inset-x-0 top-full hidden border-t border-line bg-paper shadow-[var(--shadow-float)] lg:block"
        >
          <div className="wrap grid grid-cols-[1fr_17rem] gap-10 py-9 motion-safe:animate-fade-in">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1 xl:grid-cols-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    aria-current={isActive(`/${c.slug}`) ? "page" : undefined}
                    className="group/cat block rounded-2xl px-4 py-3 transition-colors hover:bg-lake-50 aria-[current=page]:bg-lake-50"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[1.3rem] text-ink group-hover/cat:text-lake-700">{c.name}</span>
                      <span className="text-sm tabular-nums text-ink-faint">{c.count > 0 ? c.count : "Open"}</span>
                    </span>
                    {c.headline && <span className="mt-0.5 block text-[0.92rem] text-ink-soft">{c.headline}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-lake-900 p-6 text-white on-dark">
              <p className="font-display text-[1.35rem] leading-tight">Own a Branson business?</p>
              <p className="text-[0.95rem] text-lake-200">Listings start at $35 a year and link straight to your website.</p>
              <Link href="/advertise" className="btn btn-sun mt-auto">
                See advertising prices
              </Link>
              <Link href="/contact" className="btn btn-ghost-light">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile full-screen sheet */}
      <div
        id={sheetId}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!sheet}
        className="fixed inset-0 z-50 overflow-y-auto bg-lake-950 text-white on-dark lg:hidden"
      >
        <div className="wrap flex h-[var(--header-h)] items-center">
          <Link href="/" onClick={closeAll} className="flex min-h-11 items-center" aria-label="Branson Local Businesses, home">
            <Wordmark inverted />
          </Link>
          <button
            ref={sheetClose}
            type="button"
            onClick={() => setSheet(false)}
            className="ml-auto grid size-11 place-items-center rounded-full transition-colors hover:bg-white/10"
          >
            <CloseIcon size={24} />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="wrap pb-[calc(var(--bottom-bar-h)+2rem)] motion-safe:animate-fade-in">
          <form action="/search" role="search" className="relative mt-2">
            <label htmlFor="sheet-q" className="sr-only">
              Search businesses
            </label>
            <input
              id="sheet-q"
              name="q"
              type="search"
              placeholder="Search BBQ, hotels, gifts…"
              className="h-13 w-full rounded-full border border-white/20 bg-white/8 pr-14 pl-5 text-white placeholder:text-lake-200 focus:border-sun focus:outline-none"
            />
            <button type="submit" className="absolute top-1 right-1 grid size-11 place-items-center rounded-full bg-sun text-lake-950">
              <SearchIcon />
              <span className="sr-only">Search</span>
            </button>
          </form>
          <nav aria-label="All categories" className="mt-6">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${c.slug}`}
                    onClick={closeAll}
                    aria-current={isActive(`/${c.slug}`) ? "page" : undefined}
                    className="flex min-h-14 items-baseline justify-between gap-4 py-3 aria-[current=page]:text-sun"
                  >
                    <span className="font-display text-[1.6rem] leading-tight">{c.name}</span>
                    <span className="text-sm tabular-nums text-lake-300">{c.count > 0 ? c.count : "Open"}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 grid grid-cols-2 gap-3">
              <li>
                <Link href="/advertise" onClick={closeAll} className="btn btn-ghost-light w-full">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={closeAll} className="btn btn-ghost-light w-full">
                  Contact
                </Link>
              </li>
              <li className="col-span-2">
                <a href={phoneHref} className="btn btn-sun w-full">
                  <PhoneIcon size={18} /> Call {phone}
                </a>
              </li>
              <li className="col-span-2">
                <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light w-full">
                  <StarIcon size={18} /> Leave us a Google review
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile bottom action bar */}
      <nav
        aria-label="Quick actions"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 shadow-[0_-8px_30px_-18px_rgb(8_42_49/0.4)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid h-[var(--bottom-bar-h)] max-w-lg grid-cols-4 items-stretch px-2">
          <li className="contents">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 text-[0.75rem] font-medium text-ink-soft aria-[current=page]:text-lake-700"
            >
              <HomeIcon size={22} />
              Home
            </Link>
          </li>
          <li className="contents">
            <button
              type="button"
              onClick={() => setSheet(true)}
              aria-expanded={sheet}
              aria-controls={sheetId}
              className="flex flex-col items-center justify-center gap-1 text-[0.75rem] font-medium text-ink-soft"
            >
              <CompassIcon size={22} />
              Explore
            </button>
          </li>
          <li className="contents">
            <Link
              href="/search"
              aria-current={pathname === "/search" ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 text-[0.75rem] font-medium text-ink-soft aria-[current=page]:text-lake-700"
            >
              <SearchIcon size={22} />
              Search
            </Link>
          </li>
          <li className="contents">
            <a href={phoneHref} className="flex flex-col items-center justify-center gap-1 text-[0.75rem] font-semibold text-redbud">
              <span className="grid size-8 place-items-center rounded-full bg-redbud text-white">
                <PhoneIcon size={17} />
              </span>
              Call us
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
