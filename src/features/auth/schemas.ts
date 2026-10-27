import { z } from "zod"

import { OTP_LENGTH } from "@/lib/constants"
import { email, indianMobile, password } from "@/lib/validation"

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
})

export const twoStepSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code.`),
})

export const forgotPasswordSchema = z.object({ email })

const newPasswordFields = {
  newPassword: password,
  confirmPassword: z.string().min(1, "Type the new password again."),
}

function passwordsMatch<T extends { newPassword: string; confirmPassword: string }>(values: T) {
  return values.newPassword === values.confirmPassword
}

const mismatch = { message: "The passwords don't match.", path: ["confirmPassword"] }

export const resetPasswordSchema = z
  .object({ token: z.string().min(1), ...newPasswordFields })
  .refine(passwordsMatch, mismatch)

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    ...newPasswordFields,
  })
  .refine(passwordsMatch, mismatch)
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "Choose a password you haven't used here.",
    path: ["newPassword"],
  })

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Keep the name under 80 characters."),
  phone: indianMobile,
})

export type SignInValues = z.input<typeof signInSchema>
export type TwoStepValues = z.input<typeof twoStepSchema>
export type ForgotPasswordValues = z.input<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>
export type ChangePasswordValues = z.input<typeof changePasswordSchema>
export type ProfileValues = z.input<typeof profileSchema>
