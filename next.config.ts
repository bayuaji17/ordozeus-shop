import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.bandev.my.id",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
