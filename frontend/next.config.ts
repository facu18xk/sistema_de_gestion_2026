import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dsahboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
