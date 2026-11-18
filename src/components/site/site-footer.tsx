import Link from "next/link";
import { getCategories, getCurrentYear } from "@/lib/queries";
import { site } from "@/content/site";
import { FacebookIcon, GoogleIcon, InstagramIcon, PhoneIcon } from "@/components/ui/icons";
import { Contours } from "./contours";
import { Wordmark } from "./wordmark";
import { sortByNav } from "./site-header";

export async function SiteFooter() {
  const [categories, year] = await Promise.all([getCategories(), getCurrentYear()]);
  const linkCls = "inline-flex min-h-11 items-center text-lake-100 transition-colors hover:text-white sm:min-h-9";

  return (
    <footer className="on-dark relative isolate overflow-hidden bg-lake-950 pb-[calc(var(--bottom-bar-h)+1rem)] text-lake-100">
      <Contours className="absolute inset-0 -z-10 h-full w-full text-lake-800" />
      <div className="wrap grid gap-12 pt-16 pb-10 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Branson Local Businesses, home">
            <Wordmark inverted />
          </Link>
          <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-lake-200">
            A directory of locally owned restaurants, hotels, shows, shops and services in Branson, Missouri and the surrounding Ozarks.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={site.phoneHref} className="btn btn-sun">
              <PhoneIcon size={18} /> Call {site.phone}
            </a>
            <a href={site.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
              <span className="grid size-6 place-items-center rounded-full bg-white">
                <GoogleIcon size={15} />
              </span>
              Leave a review
            </a>
          </div>
        </div>

        <nav aria-label="Categories" className="md:col-span-4">
          <h2 className="font-sans text-[0.95rem] font-semibold text-white">Explore Branson</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6">
            {sortByNav(categories).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-2 gap-6 md:col-span-3 md:grid-cols-1">
          <nav aria-label="Site">
            <h2 className="font-sans text-[0.95rem] font-semibold text-white">Work with us</h2>
            <ul className="mt-3">
              <li>
                <Link href="/" className={linkCls}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/advertise" className={linkCls}>
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkCls}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/search" className={linkCls}>
                  Search
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <h2 className="font-sans text-[0.95rem] font-semibold text-white">Follow along</h2>
            <ul className="mt-3 flex gap-2">
              <li>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-11 place-items-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/16"
                >
                  <FacebookIcon />
                  <span className="sr-only">Like us on Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-11 place-items-center rounded-full bg-white/8 text-white transition-colors hover:bg-white/16"
                >
                  <InstagramIcon />
                  <span className="sr-only">Follow us on Instagram</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="flex flex-col gap-2 border-t border-white/12 py-6 text-[0.9rem] text-lake-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>
            Site by <span className="text-white">{site.credit.label}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
