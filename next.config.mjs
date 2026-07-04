/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.2.36", "localhost:3000"],

  // Performance-Optimierungen
  compiler: {
    // removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization (for future use)
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Experimental features
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
  },
};

export default nextConfig;
