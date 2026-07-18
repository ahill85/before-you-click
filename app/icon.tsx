import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Dog emoji favicon — Basil the pug. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffbeb",
          borderRadius: 14,
          fontSize: 42,
        }}
      >
        🐶
      </div>
    ),
    { ...size }
  );
}
