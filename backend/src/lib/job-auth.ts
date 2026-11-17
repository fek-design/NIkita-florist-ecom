import { createHash, timingSafeEqual } from "node:crypto";

/**
 * True when the Authorization header carries the job secret as a bearer
 * token. Both sides are hashed first so the comparison takes the same time
 * whatever the input, which stops the secret being guessed by timing.
 */
export function isAuthorisedJobCall(
  authorization: string | undefined,
  secret: string,
): boolean {
  if (!authorization?.startsWith("Bearer ") || secret.length === 0) {
    return false;
  }
  const given = createHash("sha256")
    .update(authorization.slice("Bearer ".length))
    .digest();
  const expected = createHash("sha256").update(secret).digest();
  return timingSafeEqual(given, expected);
}
