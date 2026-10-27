"use client"

import type { ReactNode } from "react"
import type { UseFormReturn } from "react-hook-form"

import { FormLayout } from "@/components/layout/FormLayout"
import { saveSettingsAction } from "@/features/settings/actions"
import type { SettingsInput, SettingsValues } from "@/features/settings/schemas"
import type { SettingsSection } from "@/features/settings/types"

type SettingsFormProps<S extends SettingsSection> = {
  section: S
  form: UseFormReturn<SettingsValues<S>, unknown, SettingsInput<S>>
  children: ReactNode
}

/** One settings tab: its fields, saved together with the sticky save bar. */
export function SettingsForm<S extends SettingsSection>({
  section,
  form,
  children,
}: SettingsFormProps<S>) {
  return (
    <FormLayout
      form={form}
      action={(values) => saveSettingsAction(section, values)}
      successMessage="Settings saved"
    >
      {children}
    </FormLayout>
  )
}
