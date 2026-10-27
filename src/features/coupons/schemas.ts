import type { Control } from "react-hook-form"
import { z } from "zod"

import type { CouponScope } from "@/features/coupons/types"
import { SCOPES_WITH_IDS } from "@/features/coupons/utils"
import { rupees, wholeNumber } from "@/lib/validation"

const date = z.iso.date("Pick a date.")
const optional = <T extends z.ZodType>(schema: T) =>
  z.union([z.literal("").transform(() => null), schema])

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{4,20}$/, "Use 4 to 20 capital letters and numbers, no spaces."),
    description: z.string().trim().min(5, "Describe the offer.").max(120),
    discountType: z.enum(["percentage", "flat"]),
    /** Percent for a percentage coupon, rupees for a flat one. */
    value: z
      .string()
      .trim()
      .regex(/^\d{1,7}(\.\d{1,2})?$/, "Enter the discount."),
    maxDiscount: optional(rupees("maximum discount")),
    scope: z.enum([
      "all",
      "product",
      "brand",
      "category",
      "first_order",
      "b2b",
      "garage",
      "service_booking",
    ] satisfies CouponScope[]),
    scopeIds: z.array(z.string()),
    minOrderValue: rupees("minimum order value"),
    startsOn: date,
    endsOn: z.union([z.literal(""), date]),
    usageLimit: optional(wholeNumber("usage limit", 1_000_000)),
    perCustomerLimit: wholeNumber("limit per customer", 100).refine((n) => n >= 1, "At least 1."),
    active: z.boolean(),
  })
  .superRefine((coupon, context) => {
    const value = Number(coupon.value)
    if (coupon.discountType === "percentage" && (value < 1 || value > 90)) {
      context.addIssue({ code: "custom", path: ["value"], message: "Between 1% and 90%." })
    }
    if (coupon.discountType === "flat" && value < 1) {
      context.addIssue({ code: "custom", path: ["value"], message: "At least ₹1." })
    }
    if (SCOPES_WITH_IDS.includes(coupon.scope) && coupon.scopeIds.length === 0) {
      context.addIssue({ code: "custom", path: ["scopeIds"], message: "Pick at least one." })
    }
    if (coupon.endsOn && coupon.endsOn < coupon.startsOn) {
      context.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "The end date must be on or after the start date.",
      })
    }
  })
  .transform(({ value, maxDiscount, scopeIds, ...coupon }) => ({
    ...coupon,
    value: coupon.discountType === "percentage" ? Number(value) : Math.round(Number(value) * 100),
    maxDiscount: coupon.discountType === "percentage" ? maxDiscount : null,
    scopeIds: SCOPES_WITH_IDS.includes(coupon.scope) ? scopeIds : [],
  }))

export type CouponValues = z.input<typeof couponSchema>
export type CouponFormOutput = z.output<typeof couponSchema>
export type CouponInput = Omit<CouponFormOutput, "startsOn" | "endsOn"> & {
  startsAt: string
  endsAt: string | null
}
export type CouponControl = Control<CouponValues, unknown, CouponFormOutput>
