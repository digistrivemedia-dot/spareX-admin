import { z } from "zod"

import { MAX_B2B_DISCOUNT_PERCENT } from "@/lib/constants"
import { rupees, wholeNumber } from "@/lib/validation"

const discountPercent = z
  .string()
  .trim()
  .regex(/^\d{1,2}(\.\d{1,2})?$/, "Enter a percentage, e.g. 12 or 12.5.")
  .transform(Number)
  .refine((value) => value <= MAX_B2B_DISCOUNT_PERCENT, `Up to ${MAX_B2B_DISCOUNT_PERCENT}%.`)

const termsDays = wholeNumber("credit terms", 180).refine((days) => days >= 1, "At least 1 day.")

/** Approving sets the discount and, optionally, turns on credit straight away. */
export const approveSchema = z
  .object({
    discountPercent,
    enableCredit: z.boolean(),
    creditLimit: z.string().trim(),
    termsDays: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (!values.enableCredit) return
    if (
      !rupees("credit limit").safeParse(values.creditLimit).success ||
      Number(values.creditLimit) <= 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["creditLimit"],
        message: "Enter the credit limit in rupees.",
      })
    }
    if (!termsDays.safeParse(values.termsDays).success) {
      context.addIssue({
        code: "custom",
        path: ["termsDays"],
        message: "Enter the terms in days, 1 to 180.",
      })
    }
  })

export const sendBackSchema = z.object({
  fields: z.array(z.string()).min(1, "Pick what needs correcting."),
  note: z.string().trim().min(5, "Tell the applicant what to fix.").max(500),
})

export const creditTermsSchema = z.object({
  limit: rupees("credit limit").refine((paise) => paise > 0, "Enter a limit above zero."),
  termsDays,
})

export const paymentSchema = z.object({
  amount: rupees("amount").refine((paise) => paise > 0, "Enter an amount above zero."),
  reference: z.string().trim().min(3, "Enter the UTR, cheque or receipt number.").max(60),
  date: z.iso
    .date("Enter the payment date.")
    .refine(
      (date) => date <= new Date().toISOString().slice(0, 10),
      "The date can't be in the future.",
    ),
})

export type ApproveValues = z.input<typeof approveSchema>
export type SendBackValues = z.input<typeof sendBackSchema>
export type CreditTermsValues = z.input<typeof creditTermsSchema>
export type PaymentValues = z.input<typeof paymentSchema>

/** What the API receives on approval. */
export type ApproveInput = {
  discountPercent: number
  credit: { limit: number; termsDays: number } | null
}
export type CreditTermsInput = z.output<typeof creditTermsSchema>
export type PaymentInput = z.output<typeof paymentSchema>
