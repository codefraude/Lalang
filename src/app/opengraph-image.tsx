import { ImageResponse } from "next/og";

export const alt = "Lalang — Translate the languages of our islands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card. Fixes the previously-referenced-but-missing OG image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg,#0b1120,#111c3a 55%,#0e2a3a)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 96,
              height: 96,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              background: "linear-gradient(135deg,#178A8F,#F57828)",
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>Lalang</div>
        </div>
        <div style={{ marginTop: 44, fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          Translate the languages of our islands
        </div>
        <div style={{ marginTop: 28, fontSize: 34, color: "#94a3b8", maxWidth: 940 }}>
          AI translation for English, French &amp; Kreol Morisien 🇲🇺
        </div>
      </div>
    ),
    { ...size },
  );
}
