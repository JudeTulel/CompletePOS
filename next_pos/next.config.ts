import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //allow unused variables
  reactStrictMode: true,
 // swcMinify: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  
};

export default nextConfig;
