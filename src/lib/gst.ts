import { GST_RATE_PERCENT } from "@/lib/constants"
import type { Paise } from "@/lib/types"

export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export function isValidGstin(value: string): boolean {
  return GSTIN_PATTERN.test(value.trim().toUpperCase())
}

/** The first two digits of a GSTIN are the state code (29 = Karnataka). */
export function gstinStateCode(gstin: string): string {
  return gstin.slice(0, 2)
}

/** Splits a GST-inclusive amount into its taxable value and tax, rounding to whole paise. */
export function splitInclusiveGst(
  amountInclGst: Paise,
  ratePercent: number = GST_RATE_PERCENT,
): { taxable: Paise; gst: Paise } {
  const taxable = Math.round((amountInclGst * 100) / (100 + ratePercent))
  return { taxable, gst: amountInclGst - taxable }
}

/** B2B price = B2C price minus the business's discount %. Both include GST. */
export function applyDiscount(price: Paise, discountPercent: number): Paise {
  return Math.round(price * (1 - discountPercent / 100))
}
