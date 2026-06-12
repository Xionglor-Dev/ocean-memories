import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "**";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,

  experimental: {
    serverActions: {
      // Large memory forms can include many photo records after upload.
      bodySizeLimit: "75mb",
    },
  },

  images: {
    // Next/Image needs the Supabase Storage host before remote photos can render.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
      },
    ],
  },
};

export default nextConfig;
