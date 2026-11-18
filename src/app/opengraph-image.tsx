import { ImageResponse } from "next/og";

export const alt = "Branson Local Businesses: we bring Branson business to one place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const contour = (y: number) =>
  `M-20 ${y} C 160 ${y - 70}, 280 ${y + 60}, 440 ${y} S 700 ${y - 90}, 860 ${y - 10} S 1120 ${y + 70}, 1240 ${y - 20}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d3b44",
          color: "#ffffff",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          {[150, 220, 290, 360, 430, 500, 570].map((y) => (
            <path key={y} d={contour(y)} fill="none" stroke="#155d6b" strokeWidth="2" />
          ))}
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: "#f0b54a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#082a31",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            BLB
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 30, lineHeight: 1.1 }}>
            <span>Branson Local Businesses</span>
            <span style={{ color: "#bcd8da", fontSize: 24 }}>Branson, Missouri</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 84, lineHeight: 1.02, letterSpacing: -2, maxWidth: 900, fontWeight: 700 }}>
          We bring Branson business to one place.
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 26, color: "#dcebea" }}>
          {["Restaurants", "Hotels", "Shows", "Shopping", "Things to do"].map((t) => (
            <span key={t} style={{ border: "2px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "8px 22px" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
