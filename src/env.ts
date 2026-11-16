/**
 * Every environment variable the server needs. Add new ones here and to
 * `.env.example`, so a missing value is caught at start-up instead of
 * failing in the middle of a customer's checkout.
 */
const required = ["DATABASE_URL"] as const;

type RequiredVar = (typeof required)[number];

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
        "Copy .env.example to .env.local and fill them in.",
    );
  }
}

export function env(name: RequiredVar): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
