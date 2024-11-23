// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default config;
