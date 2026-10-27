"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { FormAlert } from "@/components/ui/FormAlert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { verifyTwoStepAction } from "@/features/auth/actions"
import { twoStepSchema, type TwoStepValues } from "@/features/auth/schemas"
import { OTP_LENGTH } from "@/lib/constants"

export function TwoStepForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<TwoStepValues>({
    resolver: zodResolver(twoStepSchema),
    defaultValues: { code: "" },
  })

  const submit = form.handleSubmit(async (values) => {
    setError(null)
    const result = await verifyTwoStepAction(values, next)
    if (!result.ok) {
      setError(result.error)
      form.reset()
    }
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <Controller
        name="code"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="items-center">
            <FieldLabel htmlFor="code" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              id="code"
              maxLength={OTP_LENGTH}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={field.value}
              onChange={field.onChange}
              onComplete={() => submit()}
              aria-invalid={fieldState.invalid}
            >
              <InputOTPGroup>
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                  <InputOTPSlot key={index} index={index} className="size-11 text-lg" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
        Verify and sign in
      </Button>
    </form>
  )
}
