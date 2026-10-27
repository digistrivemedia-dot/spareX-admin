"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import type { FilterOption } from "@/components/ui/FilterSelect"
import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { saveVehicleModelAction } from "@/features/masters/actions"
import { vehicleModelSchema, type VehicleModelValues } from "@/features/masters/schemas"
import type { VehicleModel } from "@/features/masters/types"
import { VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"

type VehicleModelDialogProps = {
  model?: VehicleModel
  brandOptions: FilterOption[]
  trigger: ReactNode
}

/** Adds a model (then opens it to add variants), or edits `model` when given. */
export function VehicleModelDialog({ model, brandOptions, trigger }: VehicleModelDialogProps) {
  const router = useRouter()
  const values: VehicleModelValues = {
    brandId: model?.brandId ?? "",
    name: model?.name ?? "",
    vehicleType: model?.vehicleType ?? "bike",
    active: model?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(vehicleModelSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={model ? `Edit ${model.name}` : "Add vehicle model"}
      description={model ? undefined : "You can add its variants and years next."}
      form={form}
      action={async (data) => {
        const result = await saveVehicleModelAction(model?.id ?? null, data)
        if (result.ok && !model) router.push(`/masters/vehicle-models/${result.data.id}`)
        return result
      }}
      successMessage={model ? "Model saved" : "Model added"}
      submitLabel={model ? "Save" : "Add model"}
    >
      <SelectField
        control={form.control}
        name="brandId"
        label="Brand"
        options={brandOptions}
        disabled={Boolean(model)}
      />
      <TextField control={form.control} name="name" label="Model name" />
      <SelectField
        control={form.control}
        name="vehicleType"
        label="Vehicle type"
        options={VEHICLE_TYPE_OPTIONS}
      />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive models are hidden in vehicle pickers and fitment."
      />
    </FormDialog>
  )
}
