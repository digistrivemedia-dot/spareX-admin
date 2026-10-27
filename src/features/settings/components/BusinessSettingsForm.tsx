"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { SettingsForm } from "@/features/settings/components/SettingsForm"
import { SETTINGS_SCHEMAS } from "@/features/settings/schemas"
import type { BusinessSettings } from "@/features/settings/types"

export function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  const form = useForm({
    resolver: zodResolver(SETTINGS_SCHEMAS.business),
    defaultValues: settings,
  })

  return (
    <SettingsForm section="business" form={form}>
      <FormSection
        title="Business and tax"
        description="Printed as the seller on every invoice and credit note (Q-13)."
      >
        <TextField control={form.control} name="legalName" label="Legal name" />
        <TextField control={form.control} name="gstin" label="GSTIN" />
        <div className="md:col-span-2">
          <TextareaField
            control={form.control}
            name="registeredAddress"
            label="Registered address"
          />
        </div>
        <TextField
          control={form.control}
          name="invoiceNumberFormat"
          label="Invoice number format"
          description="{FY} is the financial year (26-27), {SEQ} the running number (0001)."
        />
        <TextField
          control={form.control}
          name="creditNoteNumberFormat"
          label="Credit note number format"
        />
      </FormSection>
    </SettingsForm>
  )
}
