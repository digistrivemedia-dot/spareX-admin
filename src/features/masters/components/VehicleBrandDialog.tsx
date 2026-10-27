"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { CheckboxGroupField } from "@/components/ui/CheckboxGroupField"
import { FormDialog } from "@/components/ui/FormDialog"
import { ImageField } from "@/components/ui/ImageField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { saveVehicleBrandAction } from "@/features/masters/actions"
import { vehicleBrandSchema, type VehicleBrandValues } from "@/features/masters/schemas"
import type { VehicleBrand } from "@/features/masters/types"
import { VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"

/** Adds a brand, or edits `brand` when given. */
export function VehicleBrandDialog({
  brand,
  trigger,
}: {
  brand?: VehicleBrand
  trigger: ReactNode
}) {
  const values: VehicleBrandValues = {
    name: brand?.name ?? "",
    description: brand?.description ?? "",
    vehicleTypes: brand?.vehicleTypes ?? [],
    logo: brand?.logoUrl ?? null,
    active: brand?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(vehicleBrandSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={brand ? `Edit ${brand.name}` : "Add vehicle brand"}
      form={form}
      action={(data) => saveVehicleBrandAction(brand?.id ?? null, data)}
      successMessage={brand ? "Brand saved" : "Brand added"}
      submitLabel={brand ? "Save" : "Add brand"}
    >
      <TextField control={form.control} name="name" label="Name" />
      <CheckboxGroupField
        control={form.control}
        name="vehicleTypes"
        label="Vehicle types"
        options={VEHICLE_TYPE_OPTIONS}
      />
      <TextareaField control={form.control} name="description" label="Description" />
      <ImageField control={form.control} name="logo" label="Logo" />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive brands are hidden in vehicle pickers on B2C and B2B."
      />
    </FormDialog>
  )
}
