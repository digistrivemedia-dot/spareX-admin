"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm, useWatch } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { saveVehicleVariantAction } from "@/features/masters/actions"
import { vehicleVariantSchema, type VehicleVariantValues } from "@/features/masters/schemas"
import type { VehicleVariant } from "@/features/masters/types"
import { FUEL_OPTIONS } from "@/features/masters/utils"

type VariantDialogProps = {
  modelId: string
  modelName: string
  variant?: VehicleVariant
  trigger: ReactNode
}

/** Adds or edits a variant: fuel, engine or battery size, and the model years it was sold. */
export function VariantDialog({ modelId, modelName, variant, trigger }: VariantDialogProps) {
  const thisYear = String(new Date().getFullYear())
  const values: VehicleVariantValues = {
    modelId,
    name: variant?.name ?? "",
    fuel: variant?.fuel ?? "petrol",
    engineCc: variant?.engineCc ? String(variant.engineCc) : "",
    batteryKwh: variant?.batteryKwh ? String(variant.batteryKwh) : "",
    yearFrom: String(variant?.years[0] ?? thisYear),
    yearTo: String(variant?.years.at(-1) ?? thisYear),
    active: variant?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(vehicleVariantSchema), values })
  const electric = useWatch({ control: form.control, name: "fuel" }) === "electric"

  return (
    <FormDialog
      trigger={trigger}
      title={variant ? `Edit ${modelName} ${variant.name}` : `Add variant to ${modelName}`}
      form={form}
      action={(data) => saveVehicleVariantAction(variant?.id ?? null, data)}
      successMessage={variant ? "Variant saved" : "Variant added"}
      submitLabel={variant ? "Save" : "Add variant"}
    >
      <TextField
        control={form.control}
        name="name"
        label="Variant name"
        placeholder="e.g. VXi CNG"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField control={form.control} name="fuel" label="Fuel" options={FUEL_OPTIONS} />
        {electric ? (
          <TextField
            control={form.control}
            name="batteryKwh"
            label="Battery (kWh)"
            inputMode="decimal"
          />
        ) : (
          <TextField
            control={form.control}
            name="engineCc"
            label="Engine (cc)"
            inputMode="numeric"
          />
        )}
        <TextField
          control={form.control}
          name="yearFrom"
          label="First model year"
          inputMode="numeric"
        />
        <TextField
          control={form.control}
          name="yearTo"
          label="Last model year"
          inputMode="numeric"
        />
      </div>
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive variants are hidden in vehicle pickers and fitment."
      />
    </FormDialog>
  )
}
