const STOP = new Set(["the", "a", "an", "and", "of", "at", "in", "on", "by", "llc", "inc", "co", "&", "-", "–", "|"]);

/** Initials for a business name: first letters of the first two meaningful words. */
export function initialsFor(name: string) {
  const words = name
    .replace(/\(.*?\)/g, " ")
    .replace(/['’]/g, "")
    .split(/[\s/,.:]+/)
    .filter((w) => w && !STOP.has(w.toLowerCase()) && /[a-z0-9]/i.test(w));
  const letters = words.slice(0, 2).map((w) => w.match(/[a-z0-9]/i)?.[0] ?? "");
  return (letters.join("") || name.slice(0, 1)).toUpperCase();
}

const TONES = [
  { bg: "var(--color-lake-700)", fg: "var(--color-mist)", ring: "rgb(255 255 255 / 0.32)" },
  { bg: "var(--color-redbud-soft)", fg: "var(--color-redbud-deep)", ring: "rgb(132 35 74 / 0.28)" },
  { bg: "var(--color-moss-soft)", fg: "var(--color-moss)", ring: "rgb(76 107 77 / 0.3)" },
  { bg: "var(--color-sun-soft)", fg: "var(--color-lake-900)", ring: "rgb(13 59 68 / 0.22)" },
  { bg: "var(--color-lake-100)", fg: "var(--color-lake-800)", ring: "rgb(17 74 85 / 0.25)" },
  { bg: "var(--color-lake-950)", fg: "var(--color-sun)", ring: "rgb(240 181 74 / 0.35)" },
] as const;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The default "no logo" treatment: a stamped medallion with the business's
 * initials, toned from a lakeside palette and stable per business.
 */
export function Monogram({ name, size = 56, className = "" }: { name: string; size?: number; className?: string }) {
  const tone = TONES[hash(name) % TONES.length];
  const initials = initialsFor(name);
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid shrink-0 place-items-center rounded-full select-none ${className}`}
      style={{ width: size, height: size, background: tone.bg, color: tone.fg }}
    >
      <span
        className="absolute rounded-full"
        style={{ inset: Math.max(3, size * 0.075), boxShadow: `inset 0 0 0 1px ${tone.ring}` }}
      />
      <span
        className="font-display leading-none"
        style={{ fontSize: size * (initials.length > 1 ? 0.36 : 0.44), letterSpacing: "0.02em", transform: "translateY(0.04em)" }}
      >
        {initials}
      </span>
    </span>
  );
}
