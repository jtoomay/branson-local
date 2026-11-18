"use server";

import { z } from "zod";
import { requireAdmin } from "../auth";
import { bool, businessSchema, fieldErrors, parseJsonArray, str, uuidSchema } from "../schemas";
import { removeLogos, uploadLogo, validateLogo } from "../storage";
import type { ActionResult } from "../types";
import { failure, isUniqueViolation, revalidateAll } from "./shared";

export type SaveBusinessResult = ActionResult<{ id: string; slug: string; logo_url: string | null; created: boolean }>;

export async function saveBusiness(_prev: SaveBusinessResult, formData: FormData): Promise<SaveBusinessResult> {
  try {
    const supabase = await requireAdmin();

    const idRaw = str(formData, "id");
    const id = idRaw ? uuidSchema.parse(idRaw) : null;

    const parsed = businessSchema.safeParse({
      name: str(formData, "name"),
      slug: str(formData, "slug"),
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      address: str(formData, "address"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      zip: str(formData, "zip"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      website: str(formData, "website"),
      facebook: str(formData, "facebook"),
      instagram: str(formData, "instagram"),
      maps_url: str(formData, "maps_url"),
      extra_links: parseJsonArray(str(formData, "extra_links")),
      featured: bool(formData, "featured"),
      is_published: bool(formData, "is_published"),
      sort_order: str(formData, "sort_order") || "0",
      category_ids: formData.getAll("category_ids").filter((v): v is string => typeof v === "string"),
    });

    const logo = formData.get("logo");
    const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
    const logoError = logoFile ? validateLogo(logoFile) : null;

    if (!parsed.success || logoError) {
      const errors = parsed.success ? {} : fieldErrors(parsed.error);
      if (logoError) errors.logo = logoError;
      return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: errors };
    }

    const { category_ids, ...row } = parsed.data;

    // Friendly slug uniqueness check (the DB unique constraint is the real guarantee).
    let slugQuery = supabase.from("businesses").select("id").eq("slug", row.slug).limit(1);
    if (id) slugQuery = slugQuery.neq("id", id);
    const { data: clash } = await slugQuery;
    if (clash?.length) {
      return { ok: false, message: "That slug is already taken.", fieldErrors: { slug: "Another business already uses this slug." } };
    }

    let businessId: string;
    let previousLogo: string | null = null;

    if (id) {
      const { data: existing, error: fetchError } = await supabase
        .from("businesses")
        .select("logo_url")
        .eq("id", id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!existing) return { ok: false, message: "This business no longer exists." };
      previousLogo = (existing as { logo_url: string | null }).logo_url;

      const { error } = await supabase.from("businesses").update(row).eq("id", id);
      if (error) {
        if (isUniqueViolation(error)) return { ok: false, message: "That slug is already taken.", fieldErrors: { slug: "Another business already uses this slug." } };
        throw error;
      }
      businessId = id;
    } else {
      const { data, error } = await supabase.from("businesses").insert(row).select("id").single();
      if (error) {
        if (isUniqueViolation(error)) return { ok: false, message: "That slug is already taken.", fieldErrors: { slug: "Another business already uses this slug." } };
        throw error;
      }
      businessId = (data as { id: string }).id;
    }

    // Categories: remove deselected join rows, add new ones.
    const { data: currentLinks, error: linkError } = await supabase
      .from("business_categories")
      .select("category_id")
      .eq("business_id", businessId);
    if (linkError) throw linkError;
    const current = new Set((currentLinks as { category_id: string }[]).map((r) => r.category_id));
    const wanted = new Set(category_ids);
    const toRemove = [...current].filter((c) => !wanted.has(c));
    const toAdd = [...wanted].filter((c) => !current.has(c));
    if (toRemove.length) {
      const { error } = await supabase.from("business_categories").delete().eq("business_id", businessId).in("category_id", toRemove);
      if (error) throw error;
    }
    if (toAdd.length) {
      const { error } = await supabase
        .from("business_categories")
        .insert(toAdd.map((category_id) => ({ business_id: businessId, category_id })));
      if (error) throw error;
    }

    // Logo: replace, remove or keep.
    let logoUrl = previousLogo;
    let warning = "";
    if (logoFile) {
      try {
        logoUrl = await uploadLogo(supabase, businessId, row.slug, logoFile);
        const { error } = await supabase.from("businesses").update({ logo_url: logoUrl }).eq("id", businessId);
        if (error) throw error;
        if (previousLogo && previousLogo !== logoUrl) await removeLogos(supabase, [previousLogo]);
      } catch (e) {
        logoUrl = previousLogo;
        warning = ` (but the logo could not be saved: ${e instanceof Error ? e.message : "unknown error"})`;
      }
    } else if (bool(formData, "remove_logo") && previousLogo) {
      const { error } = await supabase.from("businesses").update({ logo_url: null }).eq("id", businessId);
      if (error) throw error;
      await removeLogos(supabase, [previousLogo]);
      logoUrl = null;
    }

    revalidateAll();
    return {
      ok: !warning,
      message: (id ? `Saved “${row.name}”` : `Created “${row.name}”`) + warning,
      data: { id: businessId, slug: row.slug, logo_url: logoUrl, created: !id },
    };
  } catch (error) {
    return failure(error);
  }
}

const flagSchema = z.object({
  id: z.uuid(),
  field: z.enum(["is_published", "featured"]),
  value: z.boolean(),
});

export async function setBusinessFlag(id: string, field: "is_published" | "featured", value: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const input = flagSchema.parse({ id, field, value });
    const { data, error } = await supabase
      .from("businesses")
      .update({ [input.field]: input.value })
      .eq("id", input.id)
      .select("name")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Business not found." };
    revalidateAll();
    const name = (data as { name: string }).name;
    const label =
      input.field === "is_published" ? (input.value ? "published" : "unpublished") : input.value ? "featured" : "unfeatured";
    return { ok: true, message: `“${name}” ${label}.` };
  } catch (error) {
    return failure(error);
  }
}

const bulkSchema = z.object({
  ids: z.array(z.uuid()).min(1, { error: "Select at least one business." }).max(500),
  op: z.enum(["publish", "unpublish", "feature", "unfeature", "delete"]),
});
export type BulkOp = z.infer<typeof bulkSchema>["op"];

export async function bulkBusinesses(ids: string[], op: BulkOp): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const input = bulkSchema.parse({ ids, op });
    const n = input.ids.length;
    const noun = n === 1 ? "business" : "businesses";

    if (input.op === "delete") {
      const { data: rows, error: fetchError } = await supabase.from("businesses").select("logo_url").in("id", input.ids);
      if (fetchError) throw fetchError;
      const { error } = await supabase.from("businesses").delete().in("id", input.ids);
      if (error) throw error;
      await removeLogos(supabase, (rows as { logo_url: string | null }[]).map((r) => r.logo_url));
      revalidateAll();
      return { ok: true, message: `Deleted ${n} ${noun}.` };
    }

    const patch =
      input.op === "publish"
        ? { is_published: true }
        : input.op === "unpublish"
          ? { is_published: false }
          : input.op === "feature"
            ? { featured: true }
            : { featured: false };
    const { error } = await supabase.from("businesses").update(patch).in("id", input.ids);
    if (error) throw error;
    revalidateAll();
    return { ok: true, message: `${input.op[0].toUpperCase()}${input.op.slice(1).replace(/e$/, "")}ed ${n} ${noun}.` };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteBusiness(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const businessId = uuidSchema.parse(id);
    const { data, error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", businessId)
      .select("name, logo_url")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Business not found (it may already be deleted)." };
    const row = data as { name: string; logo_url: string | null };
    await removeLogos(supabase, [row.logo_url]);
    revalidateAll();
    return { ok: true, message: `Deleted “${row.name}”.` };
  } catch (error) {
    return failure(error);
  }
}
