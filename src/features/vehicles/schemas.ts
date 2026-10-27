import { z } from "zod"

export const transferSchema = z.object({
  vehicleId: z.string().min(1),
  customerId: z.string().min(1, "Choose the new owner."),
  date: z.iso
    .date("Enter the transfer date.")
    .refine(
      (date) => date <= new Date().toISOString().slice(0, 10),
      "The date can't be in the future.",
    ),
})

export type TransferValues = z.input<typeof transferSchema>
