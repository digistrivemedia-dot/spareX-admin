import { z } from "zod"

import { MAX_B2B_DISCOUNT_PERCENT } from "@/lib/constants"

export const discountSchema = z.object({
  businessIds: z.array(z.string()).min(1, "Choose at least one business."),
  percent: z
    .string()
    .trim()
    .regex(/^\d{1,2}(\.\d{1,2})?$/, "Enter a percentage, e.g. 12 or 12.5.")
    .transform(Number)
    .refine(
      (value) => value <= MAX_B2B_DISCOUNT_PERCENT,
      `The discount can't be more than ${MAX_B2B_DISCOUNT_PERCENT}%.`,
    ),
})

export type DiscountValues = z.input<typeof discountSchema>
export type DiscountInput = z.output<typeof discountSchema>
