/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Serve AVIF first, then WebP — both far smaller than the source PNG.
    formats: ['image/avif', 'image/webp'],
    // Optimized images are immutable content; cache them hard at the edge.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    deviceSizes: [360, 480, 640, 768, 1080, 1280, 1920],
    imageSizes: [16, 32, 64, 128, 256, 384],
  },
  // Keep modular imports lean — pull only the GSAP/lenis surface we use.
  experimental: {
    optimizePackageImports: ['gsap', 'lenis', 'framer-motion'],
  },
};

export default nextConfig;
