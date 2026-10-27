import { z } from "zod"

import type { SettingsSection } from "@/features/settings/types"
import { GSTIN_PATTERN } from "@/lib/gst"
import { rupees, wholeNumber } from "@/lib/validation"

/** One entry per line (or comma), blanks dropped. */
const lines = (label: string, pattern?: RegExp) =>
  z
    .string()
    .transform((value) =>
      value
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
    .refine((entries) => entries.length > 0, `Add at least one ${label}.`)
    .refine(
      (entries) => !pattern || entries.every((entry) => pattern.test(entry)),
      `Check the ${label}s: one per line.`,
    )

const between = (label: string, min: number, max: number) =>
  wholeNumber(label, max).refine((value) => value >= min, `At least ${min}.`)

const numberFormat = z
  .string()
  .trim()
  .refine((value) => value.includes("{SEQ}"), "Include {SEQ} for the running number.")

export const SETTINGS_SCHEMAS = {
  business: z.object({
    legalName: z.string().trim().min(3, "Enter the legal name.").max(120),
    gstin: z
      .string()
      .trim()
      .toUpperCase()
      .regex(GSTIN_PATTERN, "Enter a valid 15-character GSTIN."),
    registeredAddress: z.string().trim().min(10, "Enter the full address.").max(300),
    invoiceNumberFormat: numberFormat,
    creditNoteNumberFormat: numberFormat,
  }),
  delivery: z.object({
    deliveryCharge: rupees("delivery charge"),
    freeDeliveryAbove: rupees("free delivery amount"),
    serviceablePincodes: lines("PIN code", /^\d{6}(-\d{6})?$/),
    codEnabled: z.boolean(),
    codLimit: rupees("COD limit"),
    codFee: rupees("COD fee"),
  }),
  orders: z.object({
    returnWindowDays: between("return window", 0, 60),
    nonReturnableCategoryIds: z.array(z.string()),
  }),
  quotations: z.object({ validityDays: between("validity", 1, 90) }),
  service: z.object({
    pickupWindows: lines("pickup window"),
    inspectionFee: rupees("inspection fee"),
    timeSlots: lines("time slot"),
  }),
  security: z.object({
    otpExpiryMinutes: between("code expiry", 1, 30),
    otpMaxAttempts: between("attempts", 1, 10),
    otpResendSeconds: between("resend wait", 10, 300),
  }),
} satisfies Record<SettingsSection, z.ZodType>

export type SettingsValues<S extends SettingsSection> = z.input<(typeof SETTINGS_SCHEMAS)[S]>
export type SettingsInput<S extends SettingsSection> = z.output<(typeof SETTINGS_SCHEMAS)[S]>

export const integrationKeysSchema = z.object({
  mode: z.enum(["test", "live"]),
  keyId: z.string().trim().min(8, "Paste the key ID from the provider's dashboard.").max(80),
  secret: z.string().trim().min(8, "Paste the secret.").max(120),
})

export type IntegrationKeysValues = z.input<typeof integrationKeysSchema>
