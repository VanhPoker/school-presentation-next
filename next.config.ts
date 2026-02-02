import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-dev.gkebooks.click",
      },
      {
        protocol: "https",
        hostname: "b30c984e6409dcc3d6f2980b19b08ed0.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
