import { z } from "zod"

import type { ItemCondition } from "@/features/returns/types"
import { PICKUP_WINDOWS } from "@/lib/constants"

const today = () => new Date().toISOString().slice(0, 10)

export const pickupSchema = z.object({
  date: z.iso
    .date("Pick a date.")
    .refine((date) => date >= today(), "The pickup can't be in the past."),
  window: z.enum(PICKUP_WINDOWS, "Pick a time window."),
})

export const verifySchema = z.object({
  condition: z.enum(
    ["unused", "opened", "used", "damaged"] satisfies ItemCondition[],
    "Pick the condition.",
  ),
  notes: z.string().trim().min(5, "Say what you checked (at least 5 characters).").max(500),
  photos: z.array(z.union([z.string(), z.instanceof(File)])).max(6, "Add up to 6 photos."),
})

export type PickupValues = z.input<typeof pickupSchema>
export type PickupInput = z.output<typeof pickupSchema>
export type VerifyValues = z.input<typeof verifySchema>
export type VerifyInput = Omit<z.output<typeof verifySchema>, "photos"> & { photos: string[] }
