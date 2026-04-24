import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  output: "export",

  basePath,
  assetPrefix: basePath,

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
};

export default nextConfig;
