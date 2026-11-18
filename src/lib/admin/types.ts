/** Shape returned by every admin server action. Safe to import from client components. */
export type ActionResult<T = undefined> = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  data?: T;
};

export const LOGO_MAX_BYTES = 950 * 1024; // server actions cap request bodies at 1MB by default
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"] as const;

export const BUSINESS_SORTS = {
  name: "Name",
  updated_at: "Last updated",
  created_at: "Created",
  sort_order: "Sort order",
} as const;
export type BusinessSort = keyof typeof BUSINESS_SORTS;
export const PAGE_SIZE = 25;
