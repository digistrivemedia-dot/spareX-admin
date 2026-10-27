import { z } from "zod"

import { PASSWORD_MIN_LENGTH } from "@/lib/constants"

/** Indian mobile number; accepts spaces and an optional +91, and stores it as "+919845012345". */
export const indianMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
  .refine((value) => /^[6-9]\d{9}$/.test(value), "Enter a 10-digit mobile number.")
  .transform((value) => `+91${value}`)

export const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.")

export const email = z.email("Enter a valid email address.").trim().toLowerCase()

/** An amount typed in rupees ("849" or "849.50"), stored as paise. */
export function rupees(label: string) {
  return z
    .string()
    .trim()
    .regex(/^\d{1,7}(\.\d{1,2})?$/, `Enter the ${label} in rupees.`)
    .transform((value) => Math.round(Number(value) * 100))
}

/** A whole number typed as text, from 0 to `max`. */
export function wholeNumber(label: string, max: number) {
  return z
    .string()
    .trim()
    .regex(/^\d+$/, `Enter the ${label} as a whole number.`)
    .transform(Number)
    .refine((value) => value <= max, `The ${label} can't be more than ${max}.`)
}

/** The reason recorded with a reject, hold, deactivate or cancel. */
export const reason = z
  .string()
  .trim()
  .min(5, "Give a short reason (at least 5 characters).")
  .max(500, "Keep it under 500 characters.")
