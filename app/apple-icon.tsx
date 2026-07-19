import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — happy Basil on cream. */
export default function AppleIcon() {
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
          borderRadius: 36,
          position: "relative",
        }}
      >
        {/* Ears */}
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 32,
            width: 36,
            height: 44,
            background: "#57534e",
            borderRadius: "50% 50% 40% 40%",
            transform: "rotate(-20deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 28,
            top: 32,
            width: 36,
            height: 44,
            background: "#57534e",
            borderRadius: "50% 50% 40% 40%",
            transform: "rotate(20deg)",
          }}
        />
        {/* Head */}
        <div
          style={{
            width: 118,
            height: 108,
            background: "#e7c894",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginTop: 8,
          }}
        >
          {/* Eyes */}
          <div style={{ position: "absolute", left: 28, top: 34, width: 22, height: 22, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 12, height: 12, background: "#292524", borderRadius: "50%" }} />
          </div>
          <div style={{ position: "absolute", right: 28, top: 34, width: 22, height: 22, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 12, height: 12, background: "#292524", borderRadius: "50%" }} />
          </div>
          {/* Muzzle */}
          <div
            style={{
              position: "absolute",
              bottom: 18,
              width: 58,
              height: 44,
              background: "#78716c",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 22, height: 16, background: "#1c1917", borderRadius: "50%", marginTop: -6 }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
