import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { contact, site } from "@/content/site";
import { absoluteUrl, breadcrumbJsonLd, graph, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { Breadcrumbs } from "@/components/site/sections";
import { FacebookIcon, InstagramIcon, PhoneIcon } from "@/components/ui/icons";
import { ContactForm, ContactFormFromParams } from "./contact-form";

export const metadata: Metadata = pageMetadata({
  title: "Contact Branson Local Businesses | Get Your Business Listed",
  absoluteTitle: true,
  description:
    "Have questions or want to promote your Branson business? Fill out the short form or call 816-419-0957 and we'll get back to you as soon as possible.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          { "@type": "ContactPage", name: contact.title, url: absoluteUrl("/contact") },
        )}
      />
      <div className="wrap grid gap-12 pt-6 pb-20 sm:pt-8 sm:pb-28 lg:grid-cols-12 lg:gap-14">
        <header className="lg:col-span-5">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
          <h1 className="type-display mt-8">{contact.title}</h1>
          <p className="type-lede mt-5">{contact.intro}</p>

          <div className="on-dark mt-10 rounded-[var(--radius-tile)] bg-lake-900 p-7 text-white">
            <p className="text-[0.95rem] text-lake-200">Rather talk it through?</p>
            <a href={site.phoneHref} className="mt-1 flex min-h-11 items-center gap-3 font-display text-[2rem] leading-tight hover:text-sun">
              <PhoneIcon size={26} className="shrink-0" />
              {site.phone}
            </a>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/12 pt-5">
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light min-h-11 px-4">
                <FacebookIcon size={18} /> Facebook
              </a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light min-h-11 px-4">
                <InstagramIcon size={18} /> Instagram
              </a>
            </div>
          </div>

          <p className="mt-6 text-ink-soft">
            Looking for prices first?{" "}
            <Link href="/advertise" className="link-underline font-medium text-lake-700">
              See the advertising price list
            </Link>
          </p>
        </header>

        <section aria-label="Contact form" className="lg:col-span-7 lg:pt-16">
          <Suspense fallback={<ContactForm />}>
            <ContactFormFromParams />
          </Suspense>
        </section>
      </div>
    </>
  );
}
