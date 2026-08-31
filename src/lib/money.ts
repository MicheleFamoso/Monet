const formatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function centsToEuro(cents: number): number {
  return cents / 100;
}

export function formatEuro(cents: number): string {
  return formatter.format(centsToEuro(cents));
}

export function formatEuroCompact(cents: number): string {
  return centsToEuro(cents).toLocaleString("it-IT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function parseCents(input: string): number | null {
  const normalized = input.replace(/\s/g, "").replace(".", "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function parseInputAmount(input: string): number | null {
  return parseCents(input);
}