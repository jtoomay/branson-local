import { getCategories } from "@/lib/queries";
import { headerPrimary, navOrder, site } from "@/content/site";
import { SiteHeaderClient, type NavCategory } from "./site-header-client";

export function sortByNav<T extends { slug: string }>(items: T[]) {
  const order = navOrder as readonly string[];
  const rank = (slug: string) => {
    const i = order.indexOf(slug);
    return i === -1 ? order.length : i;
  };
  return [...items].sort((a, b) => rank(a.slug) - rank(b.slug));
}

export async function SiteHeader() {
  const categories = await getCategories();
  const nav: NavCategory[] = sortByNav(categories).map((c) => ({
    slug: c.slug,
    name: c.name,
    headline: c.headline,
    count: c.count,
  }));
  return (
    <SiteHeaderClient
      categories={nav}
      primary={[...headerPrimary]}
      phone={site.phone}
      phoneHref={site.phoneHref}
      reviewUrl={site.googleReviewUrl}
    />
  );
}
