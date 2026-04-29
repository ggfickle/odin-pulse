import type { NextConfig } from "next";

function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? (process.env.NODE_ENV === "production" ? "http://api:3101" : "http://127.0.0.1:3001");
}

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const apiBase = getApiBaseUrl();
    return [
      { source: "/api/:path*", destination: `${apiBase}/api/:path*` },
      { source: "/health", destination: `${apiBase}/health` },
      { source: "/s/:slug", destination: `${apiBase}/s/:slug` },
    ];
  },
};

export default nextConfig;
