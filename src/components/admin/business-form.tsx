"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import type { Business, Category } from "@/lib/database.types";
import { deleteBusiness, saveBusiness, type SaveBusinessResult } from "@/lib/admin/actions/businesses";
import { slugify } from "@/lib/admin/schemas";
import { LOGO_MAX_BYTES, LOGO_TYPES } from "@/lib/admin/types";
import { ConfirmDialog } from "./dialog";
import {
  IconAlert,
  IconChevronDown,
  IconChevronLeft,
  IconChevronUp,
  IconExternal,
  IconImage,
  IconLink,
  IconPlus,
  IconSpinner,
  IconTrash,
  IconX,
} from "./icons";
import { Switch } from "./switch";
import { useToast } from "./toast";
import { btn, Card, CardHeader, checkboxCls, Field, fieldAria, inputCls } from "./ui";

type LinkRow = { key: string; label: string; url: string };
type LogoState = { file: File | null; preview: string | null; remove: boolean; processing: boolean };

const initial: SaveBusinessResult = { ok: true, message: "" };
let linkKey = 0;
const newKey = () => `l${++linkKey}`;

export function BusinessForm({
  business,
  categoryIds = [],
  categories,
}: {
  business?: Business;
  categoryIds?: string[];
  categories: Pick<Category, "id" | "name">[];
}) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(business);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  const [name, setName] = useState(business?.name ?? "");
  const [slug, setSlug] = useState(business?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [published, setPublished] = useState(business?.is_published ?? true);
  const [featured, setFeatured] = useState(business?.featured ?? false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(() => new Set(categoryIds));
  const [links, setLinks] = useState<LinkRow[]>(() =>
    (business?.extra_links ?? []).map((l) => ({ key: newKey(), label: l.label, url: l.url })),
  );
  const [logo, setLogo] = useState<LogoState>({ file: null, preview: null, remove: false, processing: false });
  const [clientLogoError, setClientLogoError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();

  const [state, formAction, pending] = useActionState(async (prev: SaveBusinessResult, fd: FormData) => {
    const res = await saveBusiness(prev, fd);
    toast.result(res);
    if (res.data) {
      // Saved (possibly with a logo warning): clear local logo state; fresh props arrive via revalidation.
      setLogo((l) => {
        if (l.preview) URL.revokeObjectURL(l.preview);
        return { file: null, preview: null, remove: false, processing: false };
      });
      if (fileRef.current) fileRef.current.value = "";
      if (res.data.created) router.push(`/admin/businesses/${res.data.id}`);
    }
    if (res.fieldErrors) {
      const firstKey = Object.keys(res.fieldErrors)[0];
      requestAnimationFrame(() => focusField(firstKey));
    }
    return res;
  }, initial);

  const errors = state.fieldErrors ?? {};
  const err = (k: string) => errors[k];

  // Revoke object URLs on unmount.
  const previewRef = useRef<string | null>(null);
  useEffect(() => {
    previewRef.current = logo.preview;
  }, [logo.preview]);
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const currentLogo = logo.preview ?? (logo.remove ? null : business?.logo_url ?? null);
  const logoError = clientLogoError ?? err("logo");

  async function onPickLogo(file: File | undefined) {
    setClientLogoError(null);
    if (!file) return;
    if (!(LOGO_TYPES as readonly string[]).includes(file.type)) {
      setClientLogoError("Choose a PNG, JPEG, WebP, GIF or AVIF image.");
      return;
    }
    setLogo((l) => ({ ...l, processing: true }));
    try {
      const prepared = await prepareLogo(file);
      if (prepared.size > LOGO_MAX_BYTES) {
        setClientLogoError("That image is too large even after resizing. Try a smaller file (under 950 KB).");
        setLogo((l) => ({ ...l, processing: false }));
        return;
      }
      setLogo((l) => {
        if (l.preview) URL.revokeObjectURL(l.preview);
        return { file: prepared, preview: URL.createObjectURL(prepared), remove: false, processing: false };
      });
    } catch {
      setClientLogoError("Could not read that image.");
      setLogo((l) => ({ ...l, processing: false }));
    }
  }

  function clearLogo() {
    setClientLogoError(null);
    if (fileRef.current) fileRef.current.value = "";
    setLogo((l) => {
      if (l.preview) URL.revokeObjectURL(l.preview);
      // Pending upload -> just discard it; otherwise mark the saved logo for removal.
      return { file: null, preview: null, remove: l.file ? l.remove : true, processing: false };
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (logo.processing) return;
    const fd = new FormData(e.currentTarget);
    fd.delete("logo_picker");
    fd.set("extra_links", JSON.stringify(links.map(({ label, url }) => ({ label, url }))));
    if (logo.file) fd.set("logo", logo.file, logo.file.name);
    fd.set("remove_logo", logo.remove ? "1" : "");
    // Dispatch manually (instead of <form action>) so React doesn't reset the uncontrolled fields.
    startTransition(() => formAction(fd));
  }

  function onDelete() {
    if (!business) return;
    startDelete(async () => {
      const res = await deleteBusiness(business.id);
      toast.result(res);
      if (res.ok) {
        setConfirmDelete(false);
        router.push("/admin/businesses");
      }
    });
  }

  const moveLink = (index: number, delta: -1 | 1) =>
    setLinks((rows) => {
      const next = [...rows];
      const target = index + delta;
      if (target < 0 || target >= next.length) return rows;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const errorCount = Object.keys(errors).length;
  const busy = pending || logo.processing;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/admin/businesses"
          className="mb-3 inline-flex items-center gap-1 rounded text-[13px] font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-[#155D6B]"
        >
          <IconChevronLeft size={14} />
          Businesses
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              {isEdit ? business!.name : "New business"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {isEdit ? (
                <>
                  Last updated{" "}
                  <time dateTime={business!.updated_at}>
                    {new Date(business!.updated_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })}
                  </time>
                </>
              ) : (
                "Add a locally owned business to the directory."
              )}
            </p>
          </div>
          {isEdit && (
            <div className="flex flex-wrap gap-2">
              <a
                href={`/business/${business!.slug}`}
                target="_blank"
                rel="noopener"
                className={btn.secondary}
                title={business!.is_published ? undefined : "Unpublished businesses are hidden from the public site"}
              >
                <IconExternal />
                View on site
                <span className="sr-only">(opens in new tab)</span>
              </a>
              <button type="button" className={btn.dangerSoft} onClick={() => setConfirmDelete(true)}>
                <IconTrash />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={errorCount ? `${uid}-summary` : undefined}>
        {business && <input type="hidden" name="id" value={business.id} />}
        <input type="hidden" name="is_published" value={published ? "1" : ""} />
        <input type="hidden" name="featured" value={featured ? "1" : ""} />

        {!state.ok && state.message && (
          <div
            id={`${uid}-summary`}
            role="alert"
            className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <IconAlert size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{state.message}</p>
              {errorCount > 1 && <p className="mt-0.5 text-red-700">{errorCount} fields need attention.</p>}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader title="Details" description="How the business appears in listings and on its page." />
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <Field id="name" label="Name" required error={err("name")} className="sm:col-span-2">
                  <input
                    {...fieldAria("name", err("name"))}
                    name="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                    className={inputCls}
                    required
                    maxLength={160}
                    autoComplete="off"
                  />
                </Field>
                <Field
                  id="slug"
                  label="URL slug"
                  required
                  error={err("slug")}
                  hint={
                    <>
                      Public URL: <span className="font-mono text-zinc-700">/business/{slug || "…"}</span>
                    </>
                  }
                  className="sm:col-span-2"
                >
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-[13px] text-zinc-400">
                        /business/
                      </span>
                      <input
                        {...fieldAria("slug", err("slug"), true)}
                        name="slug"
                        value={slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                        }}
                        className={`${inputCls} pl-[5.6rem] font-mono text-[13px]`}
                        required
                        maxLength={80}
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <button
                      type="button"
                      className={btn.secondary}
                      onClick={() => {
                        setSlug(slugify(name));
                        setSlugTouched(false);
                      }}
                      disabled={!name}
                      title="Regenerate slug from name"
                    >
                      Auto
                    </button>
                  </div>
                </Field>
                <Field id="tagline" label="Tagline" error={err("tagline")} hint="One short line shown under the name." className="sm:col-span-2">
                  <input {...fieldAria("tagline", err("tagline"), true)} name="tagline" defaultValue={business?.tagline ?? ""} className={inputCls} maxLength={200} />
                </Field>
                <Field id="description" label="Description" error={err("description")} className="sm:col-span-2">
                  <textarea
                    {...fieldAria("description", err("description"))}
                    name="description"
                    defaultValue={business?.description ?? ""}
                    rows={6}
                    className={`${inputCls} resize-y leading-relaxed`}
                    maxLength={5000}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader title="Location & contact" />
              <div className="grid gap-5 p-5 sm:grid-cols-6">
                <Field id="address" label="Street address" error={err("address")} className="sm:col-span-6">
                  <input {...fieldAria("address", err("address"))} name="address" defaultValue={business?.address ?? ""} className={inputCls} autoComplete="off" />
                </Field>
                <Field id="city" label="City" error={err("city")} className="sm:col-span-3">
                  <input {...fieldAria("city", err("city"))} name="city" defaultValue={business ? business.city ?? "" : "Branson"} className={inputCls} />
                </Field>
                <Field id="state" label="State" error={err("state")} className="sm:col-span-1">
                  <input {...fieldAria("state", err("state"))} name="state" defaultValue={business ? business.state ?? "" : "MO"} className={inputCls} />
                </Field>
                <Field id="zip" label="ZIP" error={err("zip")} className="sm:col-span-2">
                  <input {...fieldAria("zip", err("zip"))} name="zip" defaultValue={business?.zip ?? ""} className={inputCls} inputMode="numeric" />
                </Field>
                <Field id="phone" label="Phone" error={err("phone")} className="sm:col-span-3">
                  <input {...fieldAria("phone", err("phone"))} name="phone" type="tel" defaultValue={business?.phone ?? ""} className={inputCls} placeholder="(417) 555-0123" />
                </Field>
                <Field id="email" label="Email" error={err("email")} className="sm:col-span-3">
                  <input {...fieldAria("email", err("email"))} name="email" type="email" defaultValue={business?.email ?? ""} className={inputCls} />
                </Field>
                <Field id="maps_url" label="Google Maps link" error={err("maps_url")} className="sm:col-span-6">
                  <input {...fieldAria("maps_url", err("maps_url"))} name="maps_url" type="url" defaultValue={business?.maps_url ?? ""} className={inputCls} placeholder="https://maps.google.com/…" />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader title="Web & social" description="Bare domains are fine. We’ll add https:// for you." />
              <div className="grid gap-5 p-5 sm:grid-cols-3">
                <Field id="website" label="Website" error={err("website")}>
                  <input {...fieldAria("website", err("website"))} name="website" type="url" defaultValue={business?.website ?? ""} className={inputCls} placeholder="example.com" />
                </Field>
                <Field id="facebook" label="Facebook" error={err("facebook")}>
                  <input {...fieldAria("facebook", err("facebook"))} name="facebook" type="url" defaultValue={business?.facebook ?? ""} className={inputCls} placeholder="facebook.com/…" />
                </Field>
                <Field id="instagram" label="Instagram" error={err("instagram")}>
                  <input {...fieldAria("instagram", err("instagram"))} name="instagram" type="url" defaultValue={business?.instagram ?? ""} className={inputCls} placeholder="instagram.com/…" />
                </Field>
              </div>

              <div className="border-t border-zinc-100 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 id={`${uid}-links`} className="text-[13px] font-medium text-zinc-800">
                      Extra links
                    </h3>
                    <p className="text-[13px] text-zinc-500">Menus, booking pages, coupons and so on. Shown in this order.</p>
                  </div>
                  <button
                    type="button"
                    className={`${btn.secondary} ${btn.sm}`}
                    onClick={() => {
                      setLinks((rows) => [...rows, { key: newKey(), label: "", url: "" }]);
                      requestAnimationFrame(() => focusField(`extra_links.${links.length}.label`));
                    }}
                    disabled={links.length >= 20}
                  >
                    <IconPlus size={14} />
                    Add link
                  </button>
                </div>
                {err("extra_links") && <p className="mb-2 text-[13px] text-red-600">{err("extra_links")}</p>}
                {links.length === 0 ? (
                  <p className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-4 text-[13px] text-zinc-500">
                    <IconLink size={15} /> No extra links.
                  </p>
                ) : (
                  <ol className="space-y-2" aria-labelledby={`${uid}-links`}>
                    {links.map((link, i) => {
                      const labelErr = err(`extra_links.${i}.label`);
                      const urlErr = err(`extra_links.${i}.url`);
                      return (
                        <li key={link.key} className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                            <div className="sm:w-48">
                              <label htmlFor={`extra_links.${i}.label`} className="sr-only">
                                Link {i + 1} label
                              </label>
                              <input
                                {...fieldAria(`extra_links.${i}.label`, labelErr)}
                                value={link.label}
                                onChange={(e) => setLinks((rows) => rows.map((r) => (r.key === link.key ? { ...r, label: e.target.value } : r)))}
                                placeholder="Label"
                                className={inputCls}
                                maxLength={80}
                              />
                              {labelErr && (
                                <p id={`extra_links.${i}.label-error`} className="mt-1 text-[12px] text-red-600">
                                  {labelErr}
                                </p>
                              )}
                            </div>
                            <div className="flex-1">
                              <label htmlFor={`extra_links.${i}.url`} className="sr-only">
                                Link {i + 1} URL
                              </label>
                              <input
                                {...fieldAria(`extra_links.${i}.url`, urlErr)}
                                value={link.url}
                                onChange={(e) => setLinks((rows) => rows.map((r) => (r.key === link.key ? { ...r, url: e.target.value } : r)))}
                                placeholder="https://"
                                type="url"
                                className={inputCls}
                              />
                              {urlErr && (
                                <p id={`extra_links.${i}.url-error`} className="mt-1 text-[12px] text-red-600">
                                  {urlErr}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 self-end sm:self-auto sm:pt-0.5">
                              <button type="button" className={btn.icon} onClick={() => moveLink(i, -1)} disabled={i === 0} aria-label={`Move link ${i + 1} up`}>
                                <IconChevronUp />
                              </button>
                              <button
                                type="button"
                                className={btn.icon}
                                onClick={() => moveLink(i, 1)}
                                disabled={i === links.length - 1}
                                aria-label={`Move link ${i + 1} down`}
                              >
                                <IconChevronDown />
                              </button>
                              <button
                                type="button"
                                className={`${btn.icon} hover:bg-red-50 hover:text-red-600`}
                                onClick={() => setLinks((rows) => rows.filter((r) => r.key !== link.key))}
                                aria-label={`Remove link ${i + 1}${link.label ? ` (${link.label})` : ""}`}
                              >
                                <IconX />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Visibility" />
              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      Published
                    </p>
                    <p className="text-[13px] text-zinc-500">Visible on the public site.</p>
                  </div>
                  <Switch checked={published} onChange={setPublished} label="Published" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">Featured</p>
                    <p className="text-[13px] text-zinc-500">Highlighted on the homepage.</p>
                  </div>
                  <Switch checked={featured} onChange={setFeatured} label="Featured" />
                </div>
                <Field id="sort_order" label="Sort order" error={err("sort_order")} hint="Lower numbers appear first.">
                  <input
                    {...fieldAria("sort_order", err("sort_order"), true)}
                    name="sort_order"
                    type="number"
                    step={1}
                    inputMode="numeric"
                    defaultValue={business?.sort_order ?? 0}
                    className={`${inputCls} w-32 tabular-nums`}
                  />
                </Field>
              </div>
            </Card>

            <Card>
              <CardHeader title="Logo" />
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-zinc-200 bg-[conic-gradient(#f4f4f5_25%,#fff_0_50%,#f4f4f5_0_75%,#fff_0)] bg-[length:12px_12px]">
                    {logo.processing ? (
                      <IconSpinner size={20} className="text-zinc-400" />
                    ) : currentLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- blob/legacy/storage URLs; next/image remote config not owned by admin
                      <img src={currentLogo} alt={`${name || "Business"} logo preview`} className="size-full object-contain p-1.5" />
                    ) : (
                      <IconImage size={26} className="text-zinc-300" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <input
                      ref={fileRef}
                      id="logo"
                      name="logo_picker"
                      type="file"
                      accept={LOGO_TYPES.join(",")}
                      className="sr-only"
                      onChange={(e) => onPickLogo(e.target.files?.[0])}
                      aria-invalid={logoError ? true : undefined}
                      aria-describedby={logoError ? "logo-error" : "logo-hint"}
                    />
                    <label
                      htmlFor="logo"
                      className={`${btn.secondary} ${btn.sm} cursor-pointer [input:focus-visible+&]:outline-2 [input:focus-visible+&]:outline-offset-2 [input:focus-visible+&]:outline-[#155D6B]`}
                    >
                      {currentLogo ? "Replace" : "Upload"}
                    </label>
                    {(currentLogo || logo.file) && (
                      <button type="button" onClick={clearLogo} className={`${btn.ghost} ${btn.sm} text-red-600 hover:bg-red-50 hover:text-red-700`}>
                        Remove
                      </button>
                    )}
                    {logo.file && <p className="text-xs text-[#155D6B]">New logo will upload on save.</p>}
                    {logo.remove && !logo.file && <p className="text-xs text-amber-700">Logo will be removed on save.</p>}
                  </div>
                </div>
                {logoError ? (
                  <p id="logo-error" className="mt-3 text-[13px] text-red-600">
                    {logoError}
                  </p>
                ) : (
                  <p id="logo-hint" className="mt-3 text-[13px] text-zinc-500">
                    PNG, JPEG, WebP, GIF or AVIF. Large images are resized to 800px automatically.
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Categories" description={`${selectedCats.size} selected`} />
              <fieldset className="p-3">
                <legend className="sr-only">Categories</legend>
                {err("category_ids") && <p className="mb-2 px-2 text-[13px] text-red-600">{err("category_ids")}</p>}
                <ul className="grid gap-0.5">
                  {categories.map((c) => {
                    const checked = selectedCats.has(c.id);
                    return (
                      <li key={c.id}>
                        <label
                          className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                            checked ? "bg-[#155D6B]/[0.06] text-zinc-900" : "text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            name="category_ids"
                            value={c.id}
                            checked={checked}
                            onChange={() =>
                              setSelectedCats((prev) => {
                                const next = new Set(prev);
                                if (next.has(c.id)) next.delete(c.id);
                                else next.add(c.id);
                                return next;
                              })
                            }
                            className={checkboxCls}
                          />
                          {c.name}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            </Card>

            {business?.source_image_url && (
              <Card>
                <CardHeader title="Legacy source" description="Original image on the old site (read-only)." />
                <div className="p-5">
                  <label htmlFor="source_image_url" className="sr-only">
                    Source image URL
                  </label>
                  <input id="source_image_url" readOnly value={business.source_image_url} className={`${inputCls} font-mono text-xs text-zinc-600`} onFocus={(e) => e.currentTarget.select()} />
                  <a
                    href={business.source_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[#155D6B] hover:underline"
                  >
                    Open original <IconExternal size={13} />
                  </a>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sticky save bar */}
        <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:-mx-10 lg:px-10">
          <div className="flex items-center justify-end gap-2">
            <Link href="/admin/businesses" className={btn.ghost}>
              Cancel
            </Link>
            <button type="submit" className={btn.primary} disabled={busy} aria-busy={pending}>
              {pending && <IconSpinner />}
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create business"}
            </button>
          </div>
        </div>
      </form>

      {business && (
        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={onDelete}
          pending={deleting}
          title={`Delete “${business.name}”?`}
          description="This permanently removes the business, its category assignments and any uploaded logo. This can’t be undone."
          confirmLabel="Delete business"
        />
      )}
    </>
  );
}

function focusField(id: string | undefined) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el && "focus" in el) {
    (el as HTMLElement).focus();
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

/** Downscale large raster logos in the browser so uploads stay under the 1MB server-action body limit. */
async function prepareLogo(file: File): Promise<File> {
  const MAX = 800;
  if (file.type === "image/gif") return file; // keep animation; size-checked by caller
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= LOGO_MAX_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
  if (!blob) throw new Error("Encode failed");
  const base = file.name.replace(/\.[^.]+$/, "") || "logo";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}
