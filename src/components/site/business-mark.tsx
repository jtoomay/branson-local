"use client";

import Image from "next/image";
import { useState } from "react";
import { Monogram } from "./monogram";

type Props = {
  name: string;
  logoUrl: string | null;
  /** "photo" crops to fill (hotel photos), "logo" sits contained on paper. */
  fit?: "logo" | "photo";
  sizes: string;
  monogramSize?: number;
  preload?: boolean;
  className?: string;
};

/**
 * A business's visual: its logo/photo when one exists and loads, otherwise the
 * monogram medallion. Fills its (sized, positioned) parent so there's no layout shift.
 */
export function BusinessMark({ name, logoUrl, fit = "logo", sizes, monogramSize = 64, preload, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <span className={`absolute inset-0 grid place-items-center bg-lake-50 ${className}`}>
        <Monogram name={name} size={monogramSize} />
      </span>
    );
  }

  return (
    <span className={`absolute inset-0 ${fit === "logo" ? "bg-white" : "bg-lake-100"} ${className}`}>
      <Image
        src={logoUrl}
        alt={`${name} ${fit === "photo" ? "photo" : "logo"}`}
        fill
        sizes={sizes}
        preload={preload}
        unoptimized={!logoUrl.startsWith("/")}
        onError={() => setFailed(true)}
        className={fit === "photo" ? "object-cover" : "object-contain p-[9%]"}
      />
    </span>
  );
}
