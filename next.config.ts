import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Increase body size limit for Server Actions to 20MB
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
