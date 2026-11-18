import Link from "next/link";
import { Contours } from "./contours";
import { SearchForm } from "./sections";

export function NotFoundContent() {
  return (
    <section className="relative isolate overflow-hidden">
      <Contours className="absolute inset-0 -z-10 h-full w-full text-lake-100" />
      <div className="wrap py-20 sm:py-32">
        <p className="font-display text-[1.3rem] text-redbud">Page not found</p>
        <h1 className="type-display mt-2 max-w-[18ch]">This road doesn&apos;t lead anywhere in Branson</h1>
        <p className="type-lede mt-5">
          The page may have moved when we rebuilt the site, or the business may no longer be listed. Search the directory or head back home.
        </p>
        <div className="mt-8 max-w-xl">
          <SearchForm id="nf-q" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Go to the home page
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
