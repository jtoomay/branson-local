"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

type Slide = { src: string; width: number; height: number; alt: string };

const INTERVAL = 5500;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Crossfading front-page header banners. These are paid placements carrying their
 * own text, so they're always shown whole (never cropped) at their native 4:1 ratio.
 * Autoplay pauses on hover/focus, can be paused by the visitor, and never runs
 * when the visitor prefers reduced motion.
 */
export function BannerCarousel({ slides }: { slides: readonly Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const playing = !paused && !hovering && !reduced;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [playing, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured Branson businesses"
      className="relative"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      <div className="relative aspect-[4/1] overflow-hidden rounded-[calc(var(--radius-card)+2px)] bg-lake-900 shadow-[var(--shadow-float)] ring-1 ring-black/5">
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="(min-width: 1248px) 1168px, 100vw"
              preload={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lake-50 hover:text-ink"
        >
          <ChevronRightIcon size={20} className="rotate-180" />
          <span className="sr-only">Previous banner</span>
        </button>
        <div className="flex items-center gap-1.5 px-1" aria-hidden="true">
          {slides.map((s, i) => (
            <span
              key={s.src}
              className={`block h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-6 bg-lake-700" : "w-1.5 bg-line-strong"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-lake-50 hover:text-ink"
        >
          <ChevronRightIcon size={20} />
          <span className="sr-only">Next banner</span>
        </button>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="ml-auto inline-flex min-h-11 items-center rounded-full px-4 text-[0.88rem] font-medium text-ink-soft transition-colors hover:bg-lake-50 hover:text-ink"
          >
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> banner rotation</span>
          </button>
        )}
      </div>
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        {slides[index]?.alt}
      </p>
    </section>
  );
}
