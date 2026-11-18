"use server";

import { z } from "zod";
import { requireAdmin } from "../auth";
import { categorySchema, fieldErrors, str, uuidSchema } from "../schemas";
import type { ActionResult } from "../types";
import { failure, isUniqueViolation, revalidateAll } from "./shared";

export type SaveCategoryResult = ActionResult<{ id: string }>;

export async function saveCategory(_prev: SaveCategoryResult, formData: FormData): Promise<SaveCategoryResult> {
  try {
    const supabase = await requireAdmin();
    const idRaw = str(formData, "id");
    const id = idRaw ? uuidSchema.parse(idRaw) : null;

    const parsed = categorySchema.safeParse({
      name: str(formData, "name"),
      slug: str(formData, "slug"),
      headline: str(formData, "headline"),
      description: str(formData, "description"),
      seo_title: str(formData, "seo_title"),
      seo_description: str(formData, "seo_description"),
      sort_order: str(formData, "sort_order") || "0",
    });
    if (!parsed.success) {
      return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
    }

    const slugTaken = { ok: false, message: "That slug is already taken.", fieldErrors: { slug: "Another category already uses this slug." } };
    let clashQuery = supabase.from("categories").select("id").eq("slug", parsed.data.slug).limit(1);
    if (id) clashQuery = clashQuery.neq("id", id);
    const { data: clash } = await clashQuery;
    if (clash?.length) return slugTaken;

    let categoryId = id;
    if (id) {
      const { data, error } = await supabase.from("categories").update(parsed.data).eq("id", id).select("id").maybeSingle();
      if (error) {
        if (isUniqueViolation(error)) return slugTaken;
        throw error;
      }
      if (!data) return { ok: false, message: "This category no longer exists." };
    } else {
      const { data, error } = await supabase.from("categories").insert(parsed.data).select("id").single();
      if (error) {
        if (isUniqueViolation(error)) return slugTaken;
        throw error;
      }
      categoryId = (data as { id: string }).id;
    }

    revalidateAll();
    return {
      ok: true,
      message: id ? `Saved “${parsed.data.name}”.` : `Created “${parsed.data.name}”.`,
      data: { id: categoryId! },
    };
  } catch (error) {
    return failure(error);
  }
}

export type DeleteCategoryResult = ActionResult<{ needsConfirm?: boolean; count?: number }>;

/**
 * Deleting a category only removes its join rows (ON DELETE CASCADE on business_categories);
 * businesses themselves are untouched. Still, a category in use requires explicit `force`.
 */
export async function deleteCategory(id: string, force = false): Promise<DeleteCategoryResult> {
  try {
    const supabase = await requireAdmin();
    const categoryId = uuidSchema.parse(id);

    const { count, error: countError } = await supabase
      .from("business_categories")
      .select("business_id", { count: "exact", head: true })
      .eq("category_id", categoryId);
    if (countError) throw countError;
    if ((count ?? 0) > 0 && !force) {
      return {
        ok: false,
        message: `This category still has ${count} business${count === 1 ? "" : "es"}. Confirm to delete anyway.`,
        data: { needsConfirm: true, count: count ?? 0 },
      };
    }

    const { data, error } = await supabase.from("categories").delete().eq("id", categoryId).select("name").maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Category not found." };
    revalidateAll();
    return { ok: true, message: `Deleted “${(data as { name: string }).name}”.` };
  } catch (error) {
    return failure(error);
  }
}

const moveSchema = z.object({ id: z.uuid(), direction: z.enum(["up", "down"]) });

/** Swap a category with its neighbour and renumber sort_order 0..n so the ordering stays dense. */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const input = moveSchema.parse({ id, direction });
    const { data, error } = await supabase.from("categories").select("id, sort_order").order("sort_order").order("name");
    if (error) throw error;
    const ids = (data as { id: string; sort_order: number }[]).map((c) => c.id);
    const from = ids.indexOf(input.id);
    const to = input.direction === "up" ? from - 1 : from + 1;
    if (from === -1) return { ok: false, message: "Category not found." };
    if (to < 0 || to >= ids.length) return { ok: true, message: "Already at the edge." };
    [ids[from], ids[to]] = [ids[to], ids[from]];

    const current = new Map((data as { id: string; sort_order: number }[]).map((c) => [c.id, c.sort_order]));
    const updates = ids
      .map((cid, index) => ({ cid, index }))
      .filter(({ cid, index }) => current.get(cid) !== index)
      .map(({ cid, index }) => supabase.from("categories").update({ sort_order: index }).eq("id", cid));
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;

    revalidateAll();
    return { ok: true, message: "Order updated." };
  } catch (error) {
    return failure(error);
  }
}
