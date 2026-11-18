"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { advertise, contact } from "@/content/site";
import { CheckIcon } from "@/components/ui/icons";
import { submitContact, type ContactState } from "./actions";

type Preset = { place?: string; listingType?: string; packageName?: string };

const initial: ContactState = { status: "idle" };

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.95rem] font-semibold text-ink">
        {label}
        {hint && <span className="ml-1.5 font-normal text-ink-faint">{hint}</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.9rem] font-medium text-redbud">
          {error}
        </p>
      )}
    </div>
  );
}

function Choice({ name, options, defaultValue, legend, error }: { name: string; options: readonly string[]; defaultValue?: string; legend: string; error?: string }) {
  return (
    <fieldset>
      <legend className="text-[0.95rem] font-semibold text-ink">
        {legend} <span className="font-normal text-ink-faint">optional</span>
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className="relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-paper px-4 text-[0.95rem] font-medium shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] transition-colors hover:shadow-[inset_0_0_0_1.5px_var(--color-lake-500)] has-checked:bg-lake-700 has-checked:text-white has-checked:shadow-none has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-redbud"
          >
            <input type="radio" name={name} value={o} defaultChecked={defaultValue === o} className="sr-only" />
            {o}
          </label>
        ))}
        <label className="relative inline-flex min-h-11 cursor-pointer items-center rounded-full px-3 text-[0.9rem] text-ink-faint hover:text-ink has-checked:hidden has-focus-visible:outline-3 has-focus-visible:outline-redbud">
          <input type="radio" name={name} value="" defaultChecked={!defaultValue} className="sr-only" />
          Not sure yet
        </label>
      </div>
      {error && <p className="mt-1.5 text-[0.9rem] font-medium text-redbud">{error}</p>}
    </fieldset>
  );
}

export function ContactForm({ preset = {} }: { preset?: Preset }) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const statusRef = useRef<HTMLDivElement>(null);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-[var(--radius-tile)] bg-paper p-8 shadow-[0_0_0_1px_var(--color-line)] focus:outline-none sm:p-10">
        <span className="grid size-14 place-items-center rounded-full bg-moss-soft text-moss">
          <CheckIcon size={28} />
        </span>
        <h2 className="type-title mt-6">Thanks, {state.name}. Your message is on its way.</h2>
        <p className="mt-3 max-w-md text-ink-soft">
          {state.kind === "advertise"
            ? "We'll be in touch about your listing as soon as possible."
            : "We'll get back to you as soon as possible."}{" "}
          Need an answer sooner? Call 816-419-0957.
        </p>
      </div>
    );
  }

  const describe = (id: keyof typeof errors) => (errors[id] ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {});
  // Re-key the form after a failed submit so defaultValues reflect what the visitor typed.
  const formKey = state.status === "error" ? JSON.stringify(values) : "fresh";

  return (
    <form key={formKey} action={action} noValidate className="rounded-[var(--radius-tile)] bg-paper p-6 shadow-[0_0_0_1px_var(--color-line)] sm:p-10">
      {preset.packageName && (
        <p className="mb-7 rounded-2xl bg-lake-50 px-4 py-3 text-[0.95rem] text-lake-900">
          You&apos;re asking about the <strong className="font-semibold">{preset.packageName}</strong> package.
        </p>
      )}

      <div ref={statusRef} tabIndex={-1} className="focus:outline-none">
        {state.status === "error" && (
          <p role="alert" className="mb-7 rounded-2xl bg-redbud-soft px-4 py-3 font-medium text-redbud-deep">
            {state.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" required defaultValue={values.name} className="field" {...describe("name")} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={values.email} className="field" {...describe("email")} />
        </Field>
        <Field id="phone" label="Phone" hint="optional" error={errors.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={values.phone} className="field" {...describe("phone")} />
        </Field>
        <Field id="business" label="What type of business do you have?" hint="optional" error={errors.business}>
          <input id="business" name="business" autoComplete="organization" placeholder="e.g. Lakeside BBQ restaurant" defaultValue={values.business} className="field" {...describe("business")} />
        </Field>
        <div className="sm:col-span-2">
          <Field id="website" label="Website link, if you have one" hint="optional" error={errors.website}>
            <input id="website" name="website" type="url" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" defaultValue={values.website} className="field" {...describe("website")} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Choice name="place" legend="Place of listing" options={contact.placeOptions} defaultValue={values.place ?? preset.place} error={errors.place} />
        </div>
        <div className="sm:col-span-2">
          <Choice name="listingType" legend="Type of listing" options={contact.typeOptions} defaultValue={values.listingType ?? preset.listingType} error={errors.listingType} />
        </div>
        <div className="sm:col-span-2">
          <Field id="comments" label="Comments" error={errors.comments}>
            <textarea id="comments" name="comments" rows={5} defaultValue={values.comments} className="field resize-y" {...describe("comments")} />
          </Field>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company_fax">Do not fill this out</label>
        <input id="company_fax" name="company_fax" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="btn btn-accent disabled:cursor-wait disabled:opacity-70">
          {pending ? "Sending…" : "Send message"}
        </button>
        <p className="text-[0.9rem] text-ink-faint">We only use your details to reply to you.</p>
      </div>
    </form>
  );
}

/** Reads ?package= from the advertise page and preselects the matching options. */
export function ContactFormFromParams() {
  const params = useSearchParams();
  const pkg = advertise.packages.find((p) => p.id === params.get("package"));
  return <ContactForm preset={pkg ? { place: pkg.placement, listingType: pkg.listingType, packageName: pkg.name } : {}} />;
}
