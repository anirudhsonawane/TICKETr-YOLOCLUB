import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Convex Dev
      {
        protocol: "https",
        hostname: "ceaseless-cat-661.convex.cloud",
        pathname: "/api/storage/**",
      },
      // Convex Prod
      {
        protocol: "https",
        hostname: "robust-vulture-107.convex.cloud",
        pathname: "/api/storage/**",
      },
      // Example images
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      // ✅ Add your deployed domain
      {
        protocol: "https",
        hostname: "ticketr.vercel.app",
        pathname: "/**",
      },
    ],
    // Ensure static images are properly handled
    unoptimized: false,
    // Add loader configuration for better compatibility
    loader: 'default',
  },
};

export default nextConfig;
