import { z } from "zod"

export const shipSchema = z.object({
  courier: z.string().trim().min(2, "Enter the courier's name.").max(60),
  trackingNumber: z.string().trim().min(4, "Enter the tracking number.").max(40),
})

export const markPaidSchema = z.object({
  reference: z.string().trim().min(3, "Enter the UTR, receipt or COD reference.").max(60),
  date: z.iso
    .date("Enter the date it was received.")
    .refine(
      (date) => date <= new Date().toISOString().slice(0, 10),
      "The date can't be in the future.",
    ),
})

export type ShipValues = z.input<typeof shipSchema>
export type MarkPaidValues = z.input<typeof markPaidSchema>
