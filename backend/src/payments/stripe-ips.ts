// Defence in depth for the webhook (Felix, 25 Nov, option b): is the caller
// one of Stripe's published webhook addresses? The signature check is the
// real protection; this only adds a second layer.
//
// Modes (STRIPE_WEBHOOK_IP_CHECK): "report" logs unknown callers but lets
// them through (default until the hardening week), "enforce" refuses them,
// "off" skips the check. The list is fetched from Stripe and cached, never
// copied into the code, so it cannot silently go out of date. If it cannot
// be fetched, events are let through and the failure is logged: refusing
// them would lose real payments, and the signature still protects.

export const STRIPE_IPS_URL = "https://stripe.com/files/ips/ips_webhooks.json";
const CACHE_MS = 24 * 60 * 60 * 1000;

export type IpCheckMode = "report" | "enforce" | "off";

export function ipCheckMode(value: string | undefined): IpCheckMode {
  return value === "enforce" || value === "off" ? value : "report";
}

export type IpList = { ips: Set<string>; fetchedAt: number };

/** Fetches Stripe's list, keeping the last good one if a fetch fails. */
export function stripeIpSource(
  fetcher: () => Promise<string[]> = async () => {
    const res = await fetch(STRIPE_IPS_URL);
    if (!res.ok) throw new Error(`Stripe IP list: HTTP ${res.status}`);
    const body = (await res.json()) as { WEBHOOKS?: unknown };
    if (!Array.isArray(body.WEBHOOKS) || body.WEBHOOKS.length === 0) {
      throw new Error("Stripe IP list: unexpected format");
    }
    return body.WEBHOOKS.map(String);
  },
) {
  let cached: IpList | null = null;
  return async (now: number): Promise<IpList | null> => {
    if (cached && now - cached.fetchedAt < CACHE_MS) return cached;
    try {
      cached = { ips: new Set(await fetcher()), fetchedAt: now };
    } catch {
      // Keep the last good list, however old; null only if there never was one.
    }
    return cached;
  };
}

export type IpVerdict =
  | { allow: true; note?: "unknown_caller" | "list_unavailable" | "local" }
  | { allow: false };

/** Decides what to do with a caller's address. Pure, for testing. */
export function judgeCaller(
  ip: string,
  list: IpList | null,
  mode: IpCheckMode,
  isLocal: boolean,
): IpVerdict {
  if (mode === "off") return { allow: true };
  // `stripe listen` forwards from this machine during development.
  if (
    isLocal &&
    (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1")
  ) {
    return { allow: true, note: "local" };
  }
  if (!list) return { allow: true, note: "list_unavailable" };
  if (list.ips.has(ip)) return { allow: true };
  return mode === "enforce"
    ? { allow: false }
    : { allow: true, note: "unknown_caller" };
}
