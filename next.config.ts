import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  devIndicators: false,
  images: {
    // The heavy assets are pre-optimized WebP; skip next/image's on-the-fly
    // optimizer so the timeline's many frames don't stall first paint on
    // mobile / dev.
    unoptimized: true,
  },
};

export default nextConfig;
