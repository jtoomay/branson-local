import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { BusinessWithCategories, Category } from "@/lib/database.types";

/**
 * Public, cacheable reads for the directory.
 *
 * Every function uses `'use cache'` with a one-hour revalidate (the Cache Components
 * equivalent of ISR `revalidate = 3600`) and the `directory` tag. Admin mutations
 * call `revalidatePath('/', 'layout')`, which invalidates these entries; calling
 * `revalidateTag('directory')` / `updateTag('directory')` works too.
 *
 * Reads go through the cookie-less client, so only `is_published = true` rows are
 * returned (RLS), and the results are safe to share across visitors.
 */

export const DIRECTORY_TAG = "directory";

function directoryCache() {
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(DIRECTORY_TAG);
}

export type CategoryWithCount = Category & { count: number };

type RawBusiness = Omit<BusinessWithCategories, "categories"> & {
  business_categories: { categories: Pick<Category, "id" | "slug" | "name"> | null }[] | null;
};

export async function getCategories(): Promise<CategoryWithCount[]> {
  "use cache";
  directoryCache();
  const supabase = createPublicClient();
  const [{ data: categories, error }, businesses] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order").order("name"),
    getAllBusinesses(),
  ]);
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  const counts = new Map<string, number>();
  for (const b of businesses) for (const c of b.categories) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
  return (categories ?? []).map((c) => ({ ...(c as Category), count: counts.get(c.id) ?? 0 }));
}

export async function getCategory(slug: string): Promise<CategoryWithCount | null> {
  "use cache";
  directoryCache();
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

/** All published businesses with their categories, ordered by sort_order then name. */
export async function getAllBusinesses(): Promise<BusinessWithCategories[]> {
  "use cache";
  directoryCache();
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*, business_categories(categories(id, slug, name))")
    .eq("is_published", true)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Failed to load businesses: ${error.message}`);
  return ((data ?? []) as RawBusiness[]).map(({ business_categories, ...b }) => ({
    ...b,
    extra_links: Array.isArray(b.extra_links) ? b.extra_links : [],
    categories: (business_categories ?? [])
      .map((bc) => bc.categories)
      .filter((c): c is Pick<Category, "id" | "slug" | "name"> => Boolean(c)),
  }));
}

export async function getBusinessesByCategory(slug: string): Promise<BusinessWithCategories[]> {
  "use cache";
  directoryCache();
  const all = await getAllBusinesses();
  return all.filter((b) => b.categories.some((c) => c.slug === slug));
}

export async function getFeaturedBusinesses(): Promise<BusinessWithCategories[]> {
  "use cache";
  directoryCache();
  const all = await getAllBusinesses();
  return all.filter((b) => b.featured);
}

export async function getBusiness(slug: string): Promise<BusinessWithCategories | null> {
  "use cache";
  directoryCache();
  const all = await getAllBusinesses();
  return all.find((b) => b.slug === slug) ?? null;
}

/** Businesses sharing a category with the given one, closest matches first. */
export async function getRelatedBusinesses(slug: string, limit = 6): Promise<BusinessWithCategories[]> {
  "use cache";
  directoryCache();
  const all = await getAllBusinesses();
  const current = all.find((b) => b.slug === slug);
  if (!current) return [];
  const ids = new Set(current.categories.map((c) => c.id));
  return all
    .filter((b) => b.slug !== slug)
    .map((b) => ({ b, score: b.categories.filter((c) => ids.has(c.id)).length + (b.logo_url ? 0.25 : 0) }))
    .filter((x) => x.score >= 1)
    .sort((a, b) => b.score - a.score || a.b.name.localeCompare(b.b.name))
    .slice(0, limit)
    .map((x) => x.b);
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Simple ranked search over name, tagline, categories, address and description. */
export async function searchBusinesses(query: string): Promise<BusinessWithCategories[]> {
  "use cache";
  directoryCache();
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(" ").filter(Boolean);
  const all = await getAllBusinesses();
  const scored = all
    .map((b) => {
      const name = normalize(b.name);
      const meta = normalize([b.tagline, ...b.categories.map((c) => c.name)].filter(Boolean).join(" "));
      const place = normalize([b.address, b.city, b.zip].filter(Boolean).join(" "));
      const body = normalize(b.description ?? "");
      let score = 0;
      for (const t of terms) {
        if (name.includes(t)) score += name.startsWith(t) ? 6 : 4;
        else if (meta.includes(t)) score += 3;
        else if (place.includes(t)) score += 2;
        else if (body.includes(t)) score += 1;
        else return { b, score: 0 };
      }
      return { b, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.b.name.localeCompare(b.b.name));
  return scored.map((x) => x.b);
}

/** Current year, cached so it can live in the static shell. */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
