import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
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
