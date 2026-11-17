import { env } from "@/env";

/**
 * Server-side call to the backend API. Browser code calls `/api/...` on the
 * frontend instead, which next.config.ts rewrites to the backend.
 */
export async function backendFetch(path: string, init?: RequestInit) {
  const base = env("BACKEND_URL").replace(/\/$/, "");
  return fetch(`${base}${path}`, { ...init, cache: "no-store" });
}
