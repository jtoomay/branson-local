import type { MetadataRoute } from "next";
import { getAllBusinesses, getCategories } from "@/lib/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, businesses] = await Promise.all([getCategories(), getAllBusinesses()]);
  const latest = businesses.reduce((max, b) => (b.updated_at > max ? b.updated_at : max), "1970-01-01T00:00:00Z");

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/${c.slug}`),
      lastModified: c.updated_at > latest ? c.updated_at : latest,
      changeFrequency: "weekly" as const,
      priority: c.count > 0 ? 0.9 : 0.5,
    })),
    { url: absoluteUrl("/advertise"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    ...businesses.map((b) => ({
      url: absoluteUrl(`/business/${b.slug}`),
      lastModified: b.updated_at,
      changeFrequency: "monthly" as const,
      priority: b.featured ? 0.8 : 0.7,
    })),
  ];
}
