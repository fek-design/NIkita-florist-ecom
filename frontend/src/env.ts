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
