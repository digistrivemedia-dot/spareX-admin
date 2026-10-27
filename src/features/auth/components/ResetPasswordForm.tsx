"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { FormAlert } from "@/components/ui/FormAlert"
import { TextField } from "@/components/ui/TextField"
import { resetPasswordAction } from "@/features/auth/actions"
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas"
import { PASSWORD_MIN_LENGTH } from "@/lib/constants"

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  })

  const submit = form.handleSubmit(async (values) => {
    setError(null)
    // On success the action redirects to sign in.
    const result = await resetPasswordAction(values)
    if (!result.ok) setError(result.error)
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <FieldGroup className="gap-4">
        <TextField
          control={form.control}
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          description={`At least ${PASSWORD_MIN_LENGTH} characters, with a letter and a number.`}
          autoFocus
        />
        <TextField
          control={form.control}
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
        />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
        Set new password
      </Button>
    </form>
  )
}
