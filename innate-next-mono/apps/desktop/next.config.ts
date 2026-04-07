import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@innate/ui", "@innate/utils"],
};

export default nextConfig;
