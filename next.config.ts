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
      // Convex Production
      {
        protocol: "https",
        hostname: "neighborly-robin-983.convex.cloud",
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
  // Add headers for PhonePe integration
  async headers() {
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.google-analytics.com https://dgq88cldibal5.cloudfront.net https://mercurystatic.phonepe.com https://linchpin.phonepe.com https://mercury.phonepe.com https://api.phonepe.com https://mercury-t2.phonepe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' http://localhost:5000 https://api.phonepe.com https://mercury-t2.phonepe.com https://mercury.phonepe.com https://linchpin.phonepe.com https://mercurystatic.phonepe.com https://dgq88cldibal5.cloudfront.net https://neighborly-robin-983.convex.cloud wss://neighborly-robin-983.convex.cloud",
      "frame-src 'self' https://checkout.razorpay.com https://mercury-t2.phonepe.com https://mercury.phonepe.com https://api.razorpay.com",
      "worker-src 'self' blob: data:",
      "child-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

    console.log('CSP Headers being applied:', cspValue);

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue
          }
        ]
      }
    ];
  },
};

export default nextConfig;
