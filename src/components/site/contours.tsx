/**
 * Topographic contour lines, loosely traced from the folded shoreline of Table Rock Lake.
 * Decorative only; sits behind dark lake sections.
 */
export function Contours({ className = "", stroke = "currentColor" }: { className?: string; stroke?: string }) {
  const lines = [
    "M-20 120 C 120 60, 210 170, 340 120 S 560 30, 700 110 S 930 190, 1060 120 S 1250 40, 1300 90",
    "M-20 165 C 110 110, 220 215, 350 165 S 560 80, 700 155 S 920 235, 1060 165 S 1250 90, 1300 135",
    "M-20 210 C 100 160, 230 260, 360 210 S 565 130, 700 200 S 910 280, 1060 210 S 1250 140, 1300 180",
    "M-20 255 C 90 210, 240 305, 370 255 S 570 180, 700 245 S 900 325, 1060 255 S 1250 190, 1300 225",
    "M-20 300 C 80 260, 250 350, 380 300 S 575 230, 700 290 S 890 370, 1060 300 S 1250 240, 1300 270",
    "M-20 345 C 70 310, 260 395, 390 345 S 580 280, 700 335 S 880 415, 1060 345 S 1250 290, 1300 315",
    "M-20 390 C 60 360, 270 440, 400 390 S 585 330, 700 380 S 870 460, 1060 390 S 1250 340, 1300 360",
    "M-20 435 C 50 410, 280 485, 410 435 S 590 380, 700 425 S 860 505, 1060 435 S 1250 390, 1300 405",
  ];
  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox="0 0 1280 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke">
        {lines.map((d, i) => (
          <path key={i} d={d} opacity={0.5 + (i % 3) * 0.25} />
        ))}
        <ellipse cx="1040" cy="150" rx="70" ry="34" />
        <ellipse cx="1040" cy="150" rx="40" ry="18" />
        <ellipse cx="210" cy="420" rx="90" ry="30" />
      </g>
    </svg>
  );
}
