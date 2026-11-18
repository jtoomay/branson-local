import { z } from "zod";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Trimmed optional string; empty becomes null. */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} must be ${max} characters or fewer.` })
    .transform((v) => (v === "" ? null : v));

/** Optional http(s) URL. Bare domains get https:// prepended. */
const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(2000, { error: `${label} is too long.` })
    .transform((v) => (v === "" ? null : /^https?:\/\//i.test(v) ? v : `https://${v}`))
    .refine((v) => v === null || isHttpUrl(v), { error: `${label} must be a valid URL.` });

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "Slug is required." })
  .max(80, { error: "Slug must be 80 characters or fewer." })
  .regex(SLUG_RE, { error: "Use lowercase letters, numbers and single hyphens only." });

const sortOrderField = z.coerce
  .number({ error: "Sort order must be a number." })
  .int({ error: "Sort order must be a whole number." })
  .min(-100000)
  .max(100000);

export const extraLinkSchema = z.object({
  label: z.string().trim().min(1, { error: "Each link needs a label." }).max(80, { error: "Link labels must be 80 characters or fewer." }),
  url: z
    .string()
    .trim()
    .min(1, { error: "Each link needs a URL." })
    .transform((v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`))
    .refine(isHttpUrl, { error: "Each link URL must be valid." }),
});

export const businessSchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(160, { error: "Name must be 160 characters or fewer." }),
  slug: slugField,
  tagline: optionalText(200, "Tagline"),
  description: optionalText(5000, "Description"),
  address: optionalText(200, "Address"),
  city: optionalText(80, "City"),
  state: optionalText(40, "State"),
  zip: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || /^\d{5}(-\d{4})?$/.test(v), { error: "ZIP must look like 65616 or 65616-1234." }),
  phone: optionalText(40, "Phone").refine((v) => v === null || /^[0-9+().\-\s x]{7,}$/i.test(v), {
    error: "Phone number looks invalid.",
  }),
  email: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || z.email().safeParse(v).success, { error: "Enter a valid email address." }),
  website: optionalUrl("Website"),
  facebook: optionalUrl("Facebook"),
  instagram: optionalUrl("Instagram"),
  maps_url: optionalUrl("Maps URL"),
  extra_links: z.array(extraLinkSchema).max(20, { error: "At most 20 extra links." }),
  featured: z.boolean(),
  is_published: z.boolean(),
  sort_order: sortOrderField,
  category_ids: z.array(z.uuid({ error: "Invalid category." })).max(50),
});
export type BusinessInput = z.infer<typeof businessSchema>;

/** Top-level public routes. Categories live at /[slug], so these slugs would collide. */
export const RESERVED_CATEGORY_SLUGS = new Set([
  "admin", "business", "advertise", "contact", "search", "api", "sitemap.xml", "robots.txt",
  "opengraph-image", "icon", "apple-icon", "favicon.ico", "_next", "legacy",
]);

export const categorySchema = z.object({
  name: z.string().trim().min(1, { error: "Name is required." }).max(80, { error: "Name must be 80 characters or fewer." }),
  slug: slugField.refine((s) => !RESERVED_CATEGORY_SLUGS.has(s), {
    error: "That slug is reserved by another page on the site. Choose a different one.",
  }),
  headline: optionalText(200, "Headline"),
  description: optionalText(5000, "Description"),
  seo_title: optionalText(120, "SEO title"),
  seo_description: optionalText(320, "SEO description"),
  sort_order: sortOrderField,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const uuidSchema = z.uuid();

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function parseJsonArray(raw: string): unknown[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Flatten zod issues into { field: message } (first message per field; nested paths joined with "."). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
