"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { FormSection } from "@/components/layout/FormSection"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/ui/TextField"
import { updateProfileAction } from "@/features/auth/account-actions"
import { profileSchema, type ProfileValues } from "@/features/auth/schemas"
import { formatPhone } from "@/lib/format"

type ProfileDetailsFormProps = { name: string; phone: string; email: string }

export function ProfileDetailsForm({ name, phone, email }: ProfileDetailsFormProps) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name, phone: formatPhone(phone) } satisfies ProfileValues,
  })

  return (
    <FormLayout form={form} action={updateProfileAction} successMessage="Profile updated">
      <FormSection title="Personal details" description="Shown to other admins in the audit log.">
        <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
        <TextField
          control={form.control}
          name="phone"
          label="Mobile number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          description="2-step verification codes are sent here."
        />
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={email} disabled readOnly />
          <FieldDescription>Your sign-in email. A Super Admin can change it.</FieldDescription>
        </Field>
      </FormSection>
    </FormLayout>
  )
}
