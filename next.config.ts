import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones/other devices on the same LAN load the dev server (by its
  // LAN IP) without Next.js blocking HMR/asset requests as cross-origin —
  // required for testing on a real mobile device during development.
  allowedDevOrigins: ["10.198.157.192"],
  async redirects() {
    return [
      { source: "/diagnose", destination: "/app/scan", permanent: true },
      { source: "/chat", destination: "/app/assistant", permanent: true },
      { source: "/history", destination: "/app/history", permanent: true },
    ];
  },
};

export default nextConfig;
