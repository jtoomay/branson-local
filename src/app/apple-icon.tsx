import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#155d6b" }}>
        <svg width="180" height="180" viewBox="0 0 40 40">
          <path
            d="M7.5 24.5c3.2-3.6 5.4-5.4 7.6-5.4 2 0 3 1.6 4.9 1.6 2.6 0 4-4.2 7.2-4.2 2.4 0 4.2 2.4 5.3 4"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M10 28.2h20M13 31.4h14" stroke="#bcd8da" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="25.5" cy="12" r="2.4" fill="#f0b54a" />
        </svg>
      </div>
    ),
    size,
  );
}
