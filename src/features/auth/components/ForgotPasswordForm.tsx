"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MailCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/FormAlert"
import { TextField } from "@/components/ui/TextField"
import { requestPasswordResetAction } from "@/features/auth/actions"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas"

type Sent = { email: string; demoResetPath: string | null }

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<Sent | null>(null)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const submit = form.handleSubmit(async (values) => {
    setError(null)
    const result = await requestPasswordResetAction(values)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSent({ email: values.email, demoResetPath: result.data.demoResetPath })
  })

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success-700">
          <MailCheck aria-hidden className="size-6" />
        </span>
        <p className="text-sm text-gray-700">
          If <span className="font-medium text-gray-900">{sent.email}</span> belongs to an active
          admin, a reset link is on its way.
        </p>
        {sent.demoResetPath && (
          <FormAlert tone="success">
            Demo mode can&apos;t send email.{" "}
            <Link href={sent.demoResetPath} className="font-medium underline">
              Open the reset link
            </Link>
          </FormAlert>
        )}
        <Link href="/login" className="text-sm text-navy-700 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        autoFocus
      />
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
        Send reset link
      </Button>
      <Link href="/login" className="text-center text-sm text-navy-700 hover:underline">
        Back to sign in
      </Link>
    </form>
  )
}
