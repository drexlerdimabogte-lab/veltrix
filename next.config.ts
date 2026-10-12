import type { NextConfig } from "next";

// Static export for GitHub Pages. NEXT_PUBLIC_BASE_PATH is e.g. "/veltrix" for project pages, "" for local/user pages.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};
export default nextConfig;
