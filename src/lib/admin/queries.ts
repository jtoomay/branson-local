import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Business, Category, ContactSubmission } from "@/lib/database.types";
import { BUSINESS_SORTS, PAGE_SIZE, type BusinessSort } from "./types";

// All reads use the session client, so RLS lets the admin see unpublished rows and submissions.

export type CategoryRef = Pick<Category, "id" | "name" | "slug">;
export type BusinessListRow = Pick<
  Business,
  "id" | "slug" | "name" | "tagline" | "logo_url" | "city" | "featured" | "is_published" | "sort_order" | "updated_at"
> & { categories: CategoryRef[] };

/** Request timestamp for relative dates ("3h ago"). Kept out of components to keep render pure. */
export function requestNow() {
  return Date.now();
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("handled", false);
  return count ?? 0;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
  if (error) throw new Error(error.message);
  return data as Category[];
}

/** Category id -> number of businesses linked to it. */
export async function getCategoryCounts(categoryIds: string[]) {
  const supabase = await createClient();
  const entries = await Promise.all(
    categoryIds.map(async (id) => {
      const { count } = await supabase
        .from("business_categories")
        .select("business_id", { count: "exact", head: true })
        .eq("category_id", id);
      return [id, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<string, number>;
}

export async function getDashboardData() {
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const [total, published, featured, unread, recent, categories, submissions] = await Promise.all([
    supabase.from("businesses").select("id", head),
    supabase.from("businesses").select("id", head).eq("is_published", true),
    supabase.from("businesses").select("id", head).eq("featured", true),
    supabase.from("contact_submissions").select("id", head).eq("handled", false),
    supabase
      .from("businesses")
      .select("id, slug, name, logo_url, is_published, featured, updated_at")
      .order("updated_at", { ascending: false })
      .limit(8),
    getCategories(),
    supabase
      .from("contact_submissions")
      .select("id, kind, name, message, created_at, handled")
      .eq("handled", false)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);
  const counts = await getCategoryCounts(categories.map((c) => c.id));
  return {
    totals: {
      businesses: total.count ?? 0,
      published: published.count ?? 0,
      featured: featured.count ?? 0,
      unread: unread.count ?? 0,
    },
    recent: (recent.data ?? []) as Pick<Business, "id" | "slug" | "name" | "logo_url" | "is_published" | "featured" | "updated_at">[],
    categories: categories.map((c) => ({ ...c, count: counts[c.id] ?? 0 })),
    submissions: (submissions.data ?? []) as Pick<ContactSubmission, "id" | "kind" | "name" | "message" | "created_at" | "handled">[],
  };
}

export type BusinessFilters = {
  q: string;
  category: string;
  status: "all" | "published" | "draft";
  featured: "all" | "yes" | "no";
  sort: BusinessSort;
  dir: "asc" | "desc";
  page: number;
  view: "table" | "cards";
};

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseBusinessFilters(sp: RawParams): BusinessFilters {
  const status = first(sp.status);
  const featured = first(sp.featured);
  const sort = first(sp.sort);
  const dir = first(sp.dir);
  const category = first(sp.category);
  const page = Number.parseInt(first(sp.page), 10);
  return {
    q: first(sp.q).trim().slice(0, 100),
    category: UUID_RE.test(category) ? category : "",
    status: status === "published" || status === "draft" ? status : "all",
    featured: featured === "yes" || featured === "no" ? featured : "all",
    sort: sort in BUSINESS_SORTS ? (sort as BusinessSort) : "updated_at",
    dir: dir === "asc" || dir === "desc" ? dir : sort === "name" || sort === "sort_order" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    view: first(sp.view) === "cards" ? "cards" : "table",
  };
}

export async function listBusinesses(f: BusinessFilters) {
  const supabase = await createClient();
  const columns = "id, slug, name, tagline, logo_url, city, featured, is_published, sort_order, updated_at, categories(id, name, slug)";
  // When filtering by category, add an inner-joined alias so the filter doesn't trim the embedded categories list.
  let query = supabase
    .from("businesses")
    .select(f.category ? `${columns}, cat_filter:business_categories!inner(category_id)` : columns, { count: "exact" });

  if (f.category) query = query.eq("cat_filter.category_id", f.category);
  if (f.q) {
    const escaped = f.q.replace(/[\\%_]/g, (m) => `\\${m}`);
    query = query.ilike("name", `%${escaped}%`);
  }
  if (f.status !== "all") query = query.eq("is_published", f.status === "published");
  if (f.featured !== "all") query = query.eq("featured", f.featured === "yes");

  query = query.order(f.sort, { ascending: f.dir === "asc" });
  if (f.sort !== "name") query = query.order("name", { ascending: true });

  const from = (f.page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) {
    // Out-of-range page (PGRST103) -> treat as empty.
    if (error.code === "PGRST103") return { rows: [] as BusinessListRow[], total: count ?? 0 };
    throw new Error(error.message);
  }
  const rows = (data as unknown as (BusinessListRow & { cat_filter?: unknown })[]).map((row) => {
    const { cat_filter: _ignored, ...rest } = row;
    void _ignored;
    return rest;
  });
  return { rows, total: count ?? 0 };
}

export async function getBusinessForEdit(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*, business_categories(category_id)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { business_categories, ...business } = data as Business & { business_categories: { category_id: string }[] };
  return { business: business as Business, categoryIds: business_categories.map((r) => r.category_id) };
}

export type InboxFilter = "unread" | "handled" | "all";

export async function listSubmissions(filter: InboxFilter) {
  const supabase = await createClient();
  let query = supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter === "unread") query = query.eq("handled", false);
  if (filter === "handled") query = query.eq("handled", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as ContactSubmission[];
}

export async function getSubmission(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("contact_submissions").select("*").eq("id", id).maybeSingle();
  return (data as ContactSubmission | null) ?? null;
}
