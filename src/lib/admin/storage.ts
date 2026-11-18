import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { LOGO_MAX_BYTES, LOGO_TYPES } from "./types";

type Client = Awaited<ReturnType<typeof createClient>>;

export const LOGO_BUCKET = "logos";
const PUBLIC_PREFIX = `/storage/v1/object/public/${LOGO_BUCKET}/`;

/** Returns the object path inside the `logos` bucket if `url` is one of our storage URLs, else null (e.g. /legacy/*). */
export function logoPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    const parsed = new URL(url, base);
    if (parsed.origin !== base.origin) return null;
    const idx = parsed.pathname.indexOf(PUBLIC_PREFIX);
    if (idx !== 0) return null;
    const path = decodeURIComponent(parsed.pathname.slice(PUBLIC_PREFIX.length));
    return path && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function validateLogo(file: File): string | null {
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) return "Logo must be a PNG, JPEG, WebP, GIF or AVIF image.";
  if (file.size > LOGO_MAX_BYTES) return "Logo must be smaller than 950 KB.";
  if (file.size === 0) return "Logo file is empty.";
  return null;
}

/** Uploads with the admin's session (storage RLS requires is_admin()). Returns the public URL. */
export async function uploadLogo(supabase: Client, businessId: string, slug: string, file: File) {
  const path = `${businessId}/${slug}-${Date.now()}.${EXT[file.type] ?? "img"}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Logo upload failed: ${error.message}`);
  return supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best-effort removal of storage-hosted logos. Legacy /legacy/* paths are ignored. */
export async function removeLogos(supabase: Client, urls: (string | null | undefined)[]) {
  const paths = urls.map(logoPathFromUrl).filter((p): p is string => Boolean(p));
  if (!paths.length) return;
  const { error } = await supabase.storage.from(LOGO_BUCKET).remove(paths);
  if (error) console.error("[admin] failed to remove logo objects", paths, error.message);
}
