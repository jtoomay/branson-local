"use client";

import Link from "next/link";
import { startTransition, useActionState, useOptimistic, useState, useTransition } from "react";
import type { Category } from "@/lib/database.types";
import { deleteCategory, moveCategory, saveCategory, type SaveCategoryResult } from "@/lib/admin/actions/categories";
import { slugify } from "@/lib/admin/schemas";
import { ConfirmDialog, Modal } from "./dialog";
import { IconAlert, IconChevronDown, IconChevronUp, IconExternal, IconPencil, IconPlus, IconSpinner, IconTag, IconTrash } from "./icons";
import { useToast } from "./toast";
import { Badge, btn, Card, checkboxCls, EmptyState, Field, fieldAria, inputCls, PageHeader } from "./ui";

type Row = Category & { count: number };

export function CategoryManager({ categories }: { categories: Row[] }) {
  const toast = useToast();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [deletePending, startDelete] = useTransition();
  const [movePending, startMove] = useTransition();

  const [ordered, moveOptimistic] = useOptimistic(categories, (state, { id, direction }: { id: string; direction: "up" | "down" }) => {
    const next = [...state];
    const i = next.findIndex((c) => c.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= next.length) return state;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const move = (id: string, direction: "up" | "down") => {
    startMove(async () => {
      moveOptimistic({ id, direction });
      const res = await moveCategory(id, direction);
      if (!res.ok) toast.result(res);
      // Keep focus on the moved row's same button for repeated keyboard moves.
      requestAnimationFrame(() => document.getElementById(`move-${direction}-${id}`)?.focus());
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    startDelete(async () => {
      const res = await deleteCategory(deleting.id, acknowledged);
      toast.result(res);
      if (res.ok) setDeleting(null);
    });
  };

  const nextSort = categories.length ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize the directory. Order here controls the order on the public site."
        actions={
          <button type="button" className={btn.primary} onClick={() => setEditing("new")}>
            <IconPlus />
            New category
          </button>
        }
      />

      <Card className="overflow-hidden">
        {ordered.length === 0 ? (
          <EmptyState icon={<IconTag />} title="No categories yet">
            Create your first category to start organizing businesses.
          </EmptyState>
        ) : (
          <ol className="divide-y divide-zinc-100" aria-busy={movePending}>
            {ordered.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                <div className="flex flex-col">
                  <button
                    id={`move-up-${c.id}`}
                    type="button"
                    className={`${btn.icon} h-6 w-7`}
                    onClick={() => move(c.id, "up")}
                    disabled={i === 0 || movePending}
                    aria-label={`Move ${c.name} up`}
                  >
                    <IconChevronUp size={15} />
                  </button>
                  <button
                    id={`move-down-${c.id}`}
                    type="button"
                    className={`${btn.icon} h-6 w-7`}
                    onClick={() => move(c.id, "down")}
                    disabled={i === ordered.length - 1 || movePending}
                    aria-label={`Move ${c.name} down`}
                  >
                    <IconChevronDown size={15} />
                  </button>
                </div>
                <span className="hidden w-6 text-center text-xs tabular-nums text-zinc-400 sm:block" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <button
                      type="button"
                      onClick={() => setEditing(c)}
                      className="truncate rounded text-left text-sm font-medium text-zinc-900 hover:text-[#155D6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B]"
                    >
                      {c.name}
                    </button>
                    <span className="font-mono text-xs text-zinc-400">/{c.slug}</span>
                  </div>
                  {c.headline && <p className="mt-0.5 truncate text-[13px] text-zinc-500">{c.headline}</p>}
                </div>
                <Link
                  href={`/admin/businesses?category=${c.id}`}
                  className="hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B] sm:block"
                  title="View businesses in this category"
                >
                  <Badge tone={c.count ? "teal" : "neutral"}>
                    {c.count} {c.count === 1 ? "business" : "businesses"}
                  </Badge>
                </Link>
                <span className="sm:hidden">
                  <Badge tone={c.count ? "teal" : "neutral"}>{c.count}</Badge>
                </span>
                <div className="flex items-center">
                  <button type="button" className={btn.icon} onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                    <IconPencil size={15} />
                  </button>
                  <button
                    type="button"
                    className={`${btn.icon} hover:bg-red-50 hover:text-red-600`}
                    onClick={() => {
                      setAcknowledged(false);
                      setDeleting(c);
                    }}
                    aria-label={`Delete ${c.name}`}
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New category" : editing ? `Edit “${editing.name}”` : ""}
        size="lg"
      >
        {editing !== null && (
          <CategoryForm
            key={editing === "new" ? "new" : editing.id}
            category={editing === "new" ? undefined : editing}
            defaultSort={nextSort}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        pending={deletePending}
        disabled={Boolean(deleting?.count) && !acknowledged}
        title={deleting ? `Delete “${deleting.name}”?` : ""}
        description={
          deleting?.count
            ? "Businesses will not be deleted. They will just be removed from this category."
            : "This category has no businesses. Deleting it can’t be undone."
        }
        confirmLabel="Delete category"
      >
        {deleting && deleting.count > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900">
            <p className="flex items-start gap-2 font-medium">
              <IconAlert size={15} className="mt-0.5 shrink-0" />
              {deleting.count} {deleting.count === 1 ? "business is" : "businesses are"} still in this category.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5">
              <input type="checkbox" className={`${checkboxCls} mt-0.5`} checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
              <span>I understand these businesses will be uncategorized from “{deleting.name}”.</span>
            </label>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}

const initial: SaveCategoryResult = { ok: true, message: "" };

function CategoryForm({ category, defaultSort, onDone }: { category?: Row; defaultSort: number; onDone: () => void }) {
  const toast = useToast();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));

  const [state, formAction, pending] = useActionState(async (prev: SaveCategoryResult, fd: FormData) => {
    const res = await saveCategory(prev, fd);
    toast.result(res);
    if (res.ok) onDone();
    else if (res.fieldErrors) {
      const first = Object.keys(res.fieldErrors)[0];
      requestAnimationFrame(() => document.getElementById(`cat-${first}`)?.focus());
    }
    return res;
  }, initial);
  const e = state.fieldErrors ?? {};

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {category && <input type="hidden" name="id" value={category.id} />}
      {!state.ok && state.message && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <IconAlert size={15} />
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cat-name" label="Name" required error={e.name}>
          <input
            {...fieldAria("cat-name", e.name)}
            name="name"
            value={name}
            onChange={(ev) => {
              setName(ev.target.value);
              if (!slugTouched) setSlug(slugify(ev.target.value));
            }}
            className={inputCls}
            autoFocus
            maxLength={80}
          />
        </Field>
        <Field id="cat-slug" label="Slug" required error={e.slug} hint={`/${slug || "…"}`}>
          <input
            {...fieldAria("cat-slug", e.slug, true)}
            name="slug"
            value={slug}
            onChange={(ev) => {
              setSlugTouched(true);
              setSlug(ev.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            className={`${inputCls} font-mono text-[13px]`}
            maxLength={80}
            spellCheck={false}
          />
        </Field>
        <Field id="cat-headline" label="Headline" error={e.headline} hint="Large heading on the category page." className="sm:col-span-2">
          <input {...fieldAria("cat-headline", e.headline, true)} name="headline" defaultValue={category?.headline ?? ""} className={inputCls} maxLength={200} />
        </Field>
        <Field id="cat-description" label="Description" error={e.description} className="sm:col-span-2">
          <textarea
            {...fieldAria("cat-description", e.description)}
            name="description"
            defaultValue={category?.description ?? ""}
            rows={4}
            className={`${inputCls} resize-y`}
            maxLength={5000}
          />
        </Field>
        <Field id="cat-seo_title" label="SEO title" error={e.seo_title} hint="Up to ~60 characters is ideal." className="sm:col-span-2">
          <input {...fieldAria("cat-seo_title", e.seo_title, true)} name="seo_title" defaultValue={category?.seo_title ?? ""} className={inputCls} maxLength={120} />
        </Field>
        <Field id="cat-seo_description" label="SEO description" error={e.seo_description} hint="Up to ~155 characters is ideal." className="sm:col-span-2">
          <textarea
            {...fieldAria("cat-seo_description", e.seo_description, true)}
            name="seo_description"
            defaultValue={category?.seo_description ?? ""}
            rows={2}
            className={`${inputCls} resize-y`}
            maxLength={320}
          />
        </Field>
        <Field id="cat-sort_order" label="Sort order" error={e.sort_order} hint="Or use the arrows in the list.">
          <input
            {...fieldAria("cat-sort_order", e.sort_order, true)}
            name="sort_order"
            type="number"
            step={1}
            defaultValue={category?.sort_order ?? defaultSort}
            className={`${inputCls} w-32 tabular-nums`}
          />
        </Field>
      </div>
      <div className="-mx-5 mt-6 flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-end">
        {category && (
          <a href={`/${category.slug}`} target="_blank" rel="noopener" className={`${btn.ghost} sm:mr-auto`}>
            <IconExternal />
            View on site
          </a>
        )}
        <button type="button" className={btn.secondary} onClick={onDone} disabled={pending}>
          Cancel
        </button>
        <button type="submit" className={btn.primary} disabled={pending} aria-busy={pending}>
          {pending && <IconSpinner />}
          {category ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
}
