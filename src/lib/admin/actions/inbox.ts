"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "../auth";
import { uuidSchema } from "../schemas";
import type { ActionResult } from "../types";
import { failure } from "./shared";

// Submissions never appear on public pages, so only the admin needs revalidating.
function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

export async function setSubmissionHandled(id: string, handled: boolean): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const input = z.object({ id: z.uuid(), handled: z.boolean() }).parse({ id, handled });
    const { data, error } = await supabase
      .from("contact_submissions")
      .update({ handled: input.handled })
      .eq("id", input.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Message not found." };
    revalidateAdmin();
    return { ok: true, message: input.handled ? "Marked as handled." : "Marked as unhandled." };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", uuidSchema.parse(id))
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, message: "Message not found." };
    revalidateAdmin();
    return { ok: true, message: "Message deleted." };
  } catch (error) {
    return failure(error);
  }
}
