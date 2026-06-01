import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',      // Ruta origen
        destination: '/login', // Ruta destino
        permanent: true,       // true for 308 (permanent), false for 307 (temporary)
      },
    ]
  },
};

export default nextConfig;
