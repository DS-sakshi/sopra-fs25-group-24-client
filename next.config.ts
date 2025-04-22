import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  /* config options here */
};
// next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // Only use this temporarily!
  },
};
export default nextConfig;
