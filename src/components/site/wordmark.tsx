/** Brand lockup: a lake-water medallion (echoing the original BLB roundel) and a stacked serif name. */
export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="20" fill={inverted ? "var(--color-sun)" : "var(--color-lake-700)"} />
        <circle cx="20" cy="20" r="16.5" fill="none" stroke={inverted ? "rgb(8 42 49 / 0.35)" : "rgb(255 255 255 / 0.35)"} strokeWidth="1" />
        {/* three ridgelines over water */}
        <path
          d="M7.5 24.5c3.2-3.6 5.4-5.4 7.6-5.4 2 0 3 1.6 4.9 1.6 2.6 0 4-4.2 7.2-4.2 2.4 0 4.2 2.4 5.3 4"
          fill="none"
          stroke={inverted ? "var(--color-lake-950)" : "#fff"}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M10 28.2h20M13 31.4h14" stroke={inverted ? "var(--color-lake-950)" : "var(--color-lake-200)"} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="25.5" cy="12" r="2.2" fill={inverted ? "var(--color-redbud)" : "var(--color-sun)"} />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.18rem] tracking-[-0.01em] ${inverted ? "text-white" : "text-ink"}`}>Branson Local</span>
        <span className={`mt-0.5 font-display text-[0.92rem] ${inverted ? "text-lake-200" : "text-lake-700"}`}>Businesses</span>
      </span>
    </span>
  );
}
