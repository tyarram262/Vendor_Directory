import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder portfolio images used by the seed data.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Vercel Blob-hosted vendor portfolio uploads (phase 5).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB, too small for real portfolio photos uploaded
      // through addVendorImage's server action.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
