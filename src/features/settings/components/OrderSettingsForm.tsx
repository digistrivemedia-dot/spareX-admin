"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { CheckboxGroupField } from "@/components/ui/CheckboxGroupField"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { TextField } from "@/components/ui/TextField"
import { SettingsForm } from "@/features/settings/components/SettingsForm"
import { SETTINGS_SCHEMAS } from "@/features/settings/schemas"
import type { OrderSettings } from "@/features/settings/types"

type OrderSettingsFormProps = { settings: OrderSettings; categories: FilterOption[] }

export function OrderSettingsForm({ settings, categories }: OrderSettingsFormProps) {
  const form = useForm({
    resolver: zodResolver(SETTINGS_SCHEMAS.orders),
    defaultValues: {
      returnWindowDays: String(settings.returnWindowDays),
      nonReturnableCategoryIds: settings.nonReturnableCategoryIds,
    },
  })

  return (
    <SettingsForm section="orders" form={form}>
      <FormSection title="Returns" description="Applies to B2C and B2B orders (Q-12).">
        <TextField
          control={form.control}
          name="returnWindowDays"
          label="Return window (days after delivery)"
          inputMode="numeric"
        />
        <div className="md:col-span-2">
          <CheckboxGroupField
            control={form.control}
            name="nonReturnableCategoryIds"
            label="Not returnable once opened"
            options={categories}
          />
        </div>
      </FormSection>
    </SettingsForm>
  )
}
