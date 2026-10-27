"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { FormSection } from "@/components/layout/FormSection"
import { TextField } from "@/components/ui/TextField"
import { changePasswordAction } from "@/features/auth/account-actions"
import { changePasswordSchema, type ChangePasswordValues } from "@/features/auth/schemas"
import { PASSWORD_MIN_LENGTH } from "@/lib/constants"

const EMPTY: ChangePasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" }

export function ChangePasswordForm() {
  const form = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: EMPTY })

  return (
    <FormLayout
      form={form}
      action={changePasswordAction}
      successMessage="Password changed"
      submitLabel="Change password"
      resetOnSuccess
    >
      <FormSection
        title="Change password"
        description="Use a password you don't use anywhere else."
        columns="one"
      >
        <div className="grid max-w-md gap-5">
          <TextField
            control={form.control}
            name="currentPassword"
            label="Current password"
            type="password"
            autoComplete="current-password"
          />
          <TextField
            control={form.control}
            name="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            description={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
          />
        </div>
      </FormSection>
    </FormLayout>
  )
}
