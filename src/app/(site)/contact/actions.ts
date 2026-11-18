"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/server";
import { contact } from "@/content/site";

export type ContactFieldErrors = Partial<Record<"name" | "email" | "phone" | "business" | "website" | "place" | "listingType" | "comments", string>>;

export type ContactState =
  | { status: "idle" }
  | { status: "success"; kind: "contact" | "advertise"; name: string }
  | { status: "error"; message: string; fieldErrors?: ContactFieldErrors; values?: Record<string, string> };

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Keep your name under 120 characters."),
  email: z.string().trim().max(200).pipe(z.email("Enter an email address like you@example.com.")),
  phone: optionalText(40).refine((v) => !v || /^[\d\s()+.\-x]{7,}$/i.test(v), "Enter a phone number like 417-555-0123."),
  business: optionalText(160),
  website: optionalText(300).refine((v) => !v || /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v), "Enter a web address like example.com."),
  place: z.enum(contact.placeOptions).optional().or(z.literal("").transform(() => undefined)),
  listingType: z.enum(contact.typeOptions).optional().or(z.literal("").transform(() => undefined)),
  comments: z.string().trim().max(4000, "Keep comments under 4,000 characters.").optional().default(""),
});

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(
    ["name", "email", "phone", "business", "website", "place", "listingType", "comments"].map((k) => [k, String(formData.get(k) ?? "")]),
  );

  // Honeypot: real visitors never see or fill this field. Pretend success so bots move on.
  if (String(formData.get("company_fax") ?? "").trim() !== "") {
    return { status: "success", kind: "contact", name: raw.name || "there" };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactFieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Check the highlighted fields and try again.", fieldErrors, values: raw };
  }

  const d = parsed.data;
  const kind = d.place || d.listingType ? "advertise" : "contact";
  if (kind === "contact" && !d.comments) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: { comments: "Tell us how we can help, or choose a listing option above." },
      values: raw,
    };
  }

  const message = [
    d.place && `Place of listing: ${d.place}`,
    d.listingType && `Type of listing: ${d.listingType}`,
    d.website && `Website: ${d.website}`,
    d.comments && (d.place || d.listingType || d.website ? `\n${d.comments}` : d.comments),
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  const supabase = createPublicClient();
  const { error } = await supabase.from("contact_submissions").insert({
    kind,
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
    business: d.business ?? null,
    message: message || "(no comments)",
  });

  if (error) {
    console.error("contact_submissions insert failed", error.message);
    return {
      status: "error",
      message: "Your message didn't send because of a problem on our side. Try again, or call us at 816-419-0957.",
      values: raw,
    };
  }

  return { status: "success", kind, name: d.name.split(/\s+/)[0] ?? d.name };
}
