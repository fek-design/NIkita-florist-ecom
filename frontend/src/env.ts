/**
 * Every environment variable the frontend server needs. The frontend holds
 * no database credentials: all data goes through the backend API.
 */
const required = ["BACKEND_URL"] as const;

export type RequiredVar = (typeof required)[number];

export function missingEnv(
  source: Record<string, string | undefined> = process.env,
): RequiredVar[] {
  return required.filter((name) => !source[name]?.trim());
}

export function assertEnv(
  source: Record<string, string | undefined> = process.env,
): void {
  const missing = missingEnv(source);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy frontend/.env.example to frontend/.env.local and fill them in.",
    );
  }
}

export function env(name: RequiredVar): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * The shop's public address, for the sitemap, robots.txt and absolute links
 * in product data. Optional: without SITE_URL it falls back to the address
 * Vercel gives the production project, then to the local dev server.
 */
export function siteUrl(
  source: Record<string, string | undefined> = process.env,
): string {
  const explicit = source.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = source.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
