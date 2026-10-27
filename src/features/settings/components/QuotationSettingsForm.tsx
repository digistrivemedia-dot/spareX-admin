"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { TextField } from "@/components/ui/TextField"
import { SettingsForm } from "@/features/settings/components/SettingsForm"
import { SETTINGS_SCHEMAS } from "@/features/settings/schemas"
import type { QuotationSettings } from "@/features/settings/types"

export function QuotationSettingsForm({ settings }: { settings: QuotationSettings }) {
  const form = useForm({
    resolver: zodResolver(SETTINGS_SCHEMAS.quotations),
    defaultValues: { validityDays: String(settings.validityDays) },
  })

  return (
    <SettingsForm section="quotations" form={form}>
      <FormSection title="Quotations">
        <TextField
          control={form.control}
          name="validityDays"
          label="Default validity (days)"
          description="Pre-filled when an admin sends a quotation; they can change it per quotation."
          inputMode="numeric"
        />
      </FormSection>
    </SettingsForm>
  )
}
