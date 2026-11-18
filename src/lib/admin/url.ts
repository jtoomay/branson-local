import type { BusinessSort } from "./types";

/** Mirrors BusinessFilters in queries.ts (kept here so client components can import it). */
export type ListFilters = {
  q: string;
  category: string;
  status: "all" | "published" | "draft";
  featured: "all" | "yes" | "no";
  sort: BusinessSort;
  dir: "asc" | "desc";
  page: number;
  view: "table" | "cards";
};

const DEFAULTS: Omit<ListFilters, "dir"> = {
  q: "",
  category: "",
  status: "all",
  featured: "all",
  sort: "updated_at",
  page: 1,
  view: "table",
};

/** Build a /admin/businesses URL, omitting default values. Changing anything but `page` resets to page 1. */
export function businessesHref(current: ListFilters, patch: Partial<ListFilters> = {}) {
  const next: ListFilters = { ...current, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  (Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]).forEach((key) => {
    const value = next[key];
    if (value !== DEFAULTS[key] && value !== "") params.set(key, String(value));
  });
  const defaultDir = next.sort === "name" || next.sort === "sort_order" ? "asc" : "desc";
  if (next.dir !== defaultDir) params.set("dir", next.dir);
  const qs = params.toString();
  return qs ? `/admin/businesses?${qs}` : "/admin/businesses";
}
