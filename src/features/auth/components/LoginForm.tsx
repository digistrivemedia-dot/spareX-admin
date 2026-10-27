"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { FormAlert } from "@/components/ui/FormAlert"
import { TextField } from "@/components/ui/TextField"
import { signInAction } from "@/features/auth/actions"
import { signInSchema, type SignInValues } from "@/features/auth/schemas"

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const submit = form.handleSubmit(async (values) => {
    setError(null)
    // On success the action redirects, so a result only comes back on failure.
    const result = await signInAction(values, next)
    if (!result.ok) setError(result.error)
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <FieldGroup className="gap-4">
        <TextField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="username"
          autoFocus
        />
        <div className="flex flex-col gap-1.5">
          <TextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />
          <Link href="/forgot-password" className="self-end text-sm text-navy-700 hover:underline">
            Forgot password?
          </Link>
        </div>
      </FieldGroup>
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
        Sign in
      </Button>
    </form>
  )
}
