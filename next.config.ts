import type { NextConfig } from "next";

/** HostPapa can't reverse-proxy; we static-export into /before-you-click/ like hoops-redraft. */
const astarExport = process.env.ASTAR_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(astarExport
    ? {
        output: "export" as const,
        basePath: "/before-you-click",
        assetPrefix: "/before-you-click",
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
