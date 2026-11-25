/** Whole øre to Danish kroner: 25000 → "250 kr.", 125050 → "1.250,50 kr." */
export function kroner(oere: number): string {
  const value = new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: oere % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(oere / 100);
  return `${value} kr.`;
}
