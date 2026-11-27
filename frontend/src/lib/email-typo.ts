// "Mente du …@gmail.com?" (DD-25, spec checkout: "Likely typo"). Suggests a
// common domain when the typed one is one or two letters off it.
const COMMON = [
  "gmail.com",
  "hotmail.com",
  "hotmail.dk",
  "outlook.com",
  "outlook.dk",
  "live.dk",
  "live.com",
  "yahoo.com",
  "yahoo.dk",
  "icloud.com",
  "me.com",
  "mail.dk",
  "jubii.dk",
  "sol.dk",
  "stofanet.dk",
  "youmail.dk",
];

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(
        row[j]! + 1,
        row[j - 1]! + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[b.length]!;
}

/** The corrected address, or null when the domain looks right or unknown. */
export function suggestEmail(email: string): string | null {
  const at = email.trim().lastIndexOf("@");
  if (at < 1) return null;
  const local = email.trim().slice(0, at);
  const domain = email
    .trim()
    .slice(at + 1)
    .toLowerCase();
  if (domain.length < 4 || COMMON.includes(domain)) return null;
  let best: { domain: string; d: number } | null = null;
  for (const candidate of COMMON) {
    const d = distance(domain, candidate);
    if (d <= 2 && (!best || d < best.d)) best = { domain: candidate, d };
  }
  return best ? `${local}@${best.domain}` : null;
}
