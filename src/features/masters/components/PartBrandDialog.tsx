"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { ImageField } from "@/components/ui/ImageField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { savePartBrandAction } from "@/features/masters/actions"
import { partBrandSchema, type PartBrandValues } from "@/features/masters/schemas"
import type { PartBrand } from "@/features/masters/types"

export function PartBrandDialog({ brand, trigger }: { brand?: PartBrand; trigger: ReactNode }) {
  const values: PartBrandValues = {
    name: brand?.name ?? "",
    isOem: brand?.isOem ?? false,
    logo: brand?.logoUrl ?? null,
    active: brand?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(partBrandSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={brand ? `Edit ${brand.name}` : "Add part brand"}
      form={form}
      action={(data) => savePartBrandAction(brand?.id ?? null, data)}
      successMessage={brand ? "Part brand saved" : "Part brand added"}
      submitLabel={brand ? "Save" : "Add part brand"}
    >
      <TextField control={form.control} name="name" label="Name" />
      <SwitchField
        control={form.control}
        name="isOem"
        label="Genuine (OEM) parts"
        description="Parts made by the vehicle manufacturer, e.g. Honda Genuine Parts."
      />
      <ImageField control={form.control} name="logo" label="Logo" />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive brands are hidden from catalogue filters."
      />
    </FormDialog>
  )
}
