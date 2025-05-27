import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        // Suppress punycode deprecation warning
        '**/node_modules/punycode/**': {
          warnings: false
        }
      }
    }
  }
};

export default nextConfig;
