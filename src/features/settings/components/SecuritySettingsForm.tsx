"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { TextField } from "@/components/ui/TextField"
import { SettingsForm } from "@/features/settings/components/SettingsForm"
import { SETTINGS_SCHEMAS } from "@/features/settings/schemas"
import type { SecuritySettings } from "@/features/settings/types"

/** Sign-in codes sent by SMS to customers and garages on B2C and B2B. */
export function SecuritySettingsForm({ settings }: { settings: SecuritySettings }) {
  const form = useForm({
    resolver: zodResolver(SETTINGS_SCHEMAS.security),
    defaultValues: {
      otpExpiryMinutes: String(settings.otpExpiryMinutes),
      otpMaxAttempts: String(settings.otpMaxAttempts),
      otpResendSeconds: String(settings.otpResendSeconds),
    },
  })

  return (
    <SettingsForm section="security" form={form}>
      <FormSection title="OTP limits" description="For customer and garage sign-in on B2C and B2B.">
        <TextField
          control={form.control}
          name="otpExpiryMinutes"
          label="Code expires after (minutes)"
          inputMode="numeric"
        />
        <TextField
          control={form.control}
          name="otpMaxAttempts"
          label="Wrong attempts before a new code"
          inputMode="numeric"
        />
        <TextField
          control={form.control}
          name="otpResendSeconds"
          label="Wait before resending (seconds)"
          inputMode="numeric"
        />
      </FormSection>
    </SettingsForm>
  )
}
