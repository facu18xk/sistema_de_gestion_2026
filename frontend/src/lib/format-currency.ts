export function formatCurrency(
  amount: number,
  options?: { compact?: boolean }
): string {
  const formatter = new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
    notation: options?.compact ? "compact" : "standard",
  });

  return formatter.format(amount);
}

export function formatMoney(amount: number, moneda: string): string {
  const code = moneda?.toUpperCase() === "USD" ? "USD" : "PYG";
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "USD" ? 2 : 0,
  }).format(amount);
}
