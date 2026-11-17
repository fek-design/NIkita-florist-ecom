/**
 * Money is stored as whole øre (integers) so totals never suffer from
 * floating-point rounding. 250 kr. is 25000.
 */
export function formatKroner(oere: number): string {
  if (!Number.isInteger(oere)) {
    throw new TypeError("Amount must be a whole number of øre");
  }
  const kroner = new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: oere % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(oere / 100);
  return `${kroner} kr.`;
}
