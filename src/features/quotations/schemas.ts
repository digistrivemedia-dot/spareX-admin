import type { Control } from "react-hook-form"
import { z } from "zod"

import { MAX_B2B_DISCOUNT_PERCENT } from "@/lib/constants"
import { rupees, wholeNumber } from "@/lib/validation"

export const quotationSchema = z.object({
  lines: z
    .array(
      z.object({
        id: z.string(),
        productId: z.string().min(1),
        quantity: wholeNumber("quantity", 100_000).refine((value) => value > 0, "At least 1."),
        discountPercent: z
          .string()
          .trim()
          .regex(/^\d{1,2}(\.\d{1,2})?$/, "Enter a %.")
          .transform(Number)
          .refine(
            (value) => value <= MAX_B2B_DISCOUNT_PERCENT,
            `Up to ${MAX_B2B_DISCOUNT_PERCENT}%.`,
          ),
      }),
    )
    .min(1, "Add at least one product."),
  extraDiscount: rupees("extra discount"),
  validityDays: wholeNumber("validity", 90).refine((days) => days >= 1, "At least 1 day."),
  note: z.string().trim().max(200),
})

export type QuotationValues = z.input<typeof quotationSchema>
export type QuotationInput = z.output<typeof quotationSchema>
export type QuotationControl = Control<QuotationValues, unknown, QuotationInput>
