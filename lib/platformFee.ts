const DEFAULT_PLATFORM_FEE_PERCENT = 10;

/**
 * Configurable platform service fee (%). Read from env PLATFORM_FEE_PERCENT (0–100).
 * Used when creating Payment records; fee is stored per transaction for reporting.
 */
export function getPlatformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT;
  if (raw === undefined || raw === "") return DEFAULT_PLATFORM_FEE_PERCENT;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

/**
 * Compute platform fee amount (in dollars) for a given payment amount.
 * Fee is deducted automatically on payment release; stored per transaction for reporting.
 */
export function getPlatformFeeAmount(amountInDollars: number): number {
  const percent = getPlatformFeePercent();
  if (percent === 0) return 0;
  return Math.round((amountInDollars * percent) / 100);
}
