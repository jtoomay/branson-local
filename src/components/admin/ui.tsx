import type { ReactNode } from "react";

/* Shared admin styling. Brand accent: #155D6B (teal). */

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B]";
const btnBase = `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const btn = {
  primary: `${btnBase} h-9 px-3.5 bg-[#155D6B] text-white shadow-sm shadow-[#155D6B]/20 hover:bg-[#114D59] active:bg-[#0E414B]`,
  secondary: `${btnBase} h-9 px-3.5 bg-white text-zinc-800 ring-1 ring-inset ring-zinc-200 shadow-xs hover:bg-zinc-50 hover:ring-zinc-300`,
  ghost: `${btnBase} h-9 px-3 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900`,
  danger: `${btnBase} h-9 px-3.5 bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600`,
  dangerSoft: `${btnBase} h-9 px-3.5 bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50`,
  icon: `${btnBase} size-8 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900`,
  sm: "h-8 px-2.5 text-[13px]",
};

export const inputCls =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 transition-shadow " +
  "focus:border-[#155D6B] focus:outline-none focus:ring-3 focus:ring-[#155D6B]/15 " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15 disabled:bg-zinc-50 disabled:text-zinc-500";

export const selectCls = `${inputCls} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2371717a' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9`;

export const checkboxCls =
  "size-4 shrink-0 rounded border-zinc-300 accent-[#155D6B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155D6B]";

export function Field({
  id,
  label,
  hint,
  error,
  required,
  className = "",
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-zinc-800">
        {label}
        {required && (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-[13px] text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** aria props for an input rendered inside <Field>. */
export function fieldAria(id: string, error?: string, hint?: boolean) {
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  };
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-zinc-200/80 bg-white shadow-xs ${className}`}>{children}</section>;
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-[13px] text-zinc-500">{eyebrow}</div>}
        <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

type Tone = "neutral" | "teal" | "green" | "amber" | "red" | "violet" | "blue";
const tones: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  teal: "bg-[#155D6B]/8 text-[#155D6B] ring-[#155D6B]/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function Badge({ tone = "neutral", children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && <div className="mb-3 grid size-11 place-items-center rounded-full bg-zinc-100 text-zinc-500">{icon}</div>}
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-zinc-500">{children}</div>}
    </div>
  );
}

export function LogoThumb({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-500"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos come from /legacy and Supabase storage; next/image remote config is not owned by admin
        <img src={src} alt="" className="size-full object-contain p-0.5" loading="lazy" decoding="async" />
      ) : (
        <span aria-hidden="true">{initials || "?"}</span>
      )}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200/70 ${className}`} aria-hidden="true" />;
}

export function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "America/Chicago",
  });
}

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
}
