import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Development only: lets a phone on the same home network open the dev
  // server by the computer's address (usability tests, roadmap week 5).
  // Next blocks other hosts by default; production ignores this setting.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  partialPrefetching: true,
  async rewrites() {
    // Browser calls to /api/* go to the backend, so the browser only ever
    // talks to the frontend's own address. Without BACKEND_URL (as in CI
    // builds) there is nothing to rewrite to; the server refuses to start
    // without it anyway.
    const backend = process.env.BACKEND_URL?.replace(/\/$/, "");
    return backend
      ? [{ source: "/api/:path*", destination: `${backend}/:path*` }]
      : [];
  },
};

export default nextConfig;
