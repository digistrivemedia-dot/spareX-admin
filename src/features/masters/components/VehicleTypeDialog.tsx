"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { updateVehicleTypeAction } from "@/features/masters/actions"
import { vehicleTypeSchema, type VehicleTypeValues } from "@/features/masters/schemas"
import type { VehicleTypeRecord } from "@/features/masters/types"

/** Vehicle types are fixed (Q-02), so they can be edited but not added. */
export function VehicleTypeDialog({
  record,
  trigger,
}: {
  record: VehicleTypeRecord
  trigger: ReactNode
}) {
  const values: VehicleTypeValues = {
    name: record.name,
    description: record.description,
    sortOrder: String(record.sortOrder),
    active: record.active,
  }
  const form = useForm({ resolver: zodResolver(vehicleTypeSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={`Edit ${record.name}`}
      form={form}
      action={(data) => updateVehicleTypeAction(record.id, data)}
      successMessage="Vehicle type saved"
    >
      <TextField control={form.control} name="name" label="Name" />
      <TextareaField control={form.control} name="description" label="Description" />
      <TextField
        control={form.control}
        name="sortOrder"
        label="Order"
        inputMode="numeric"
        description="Lower numbers show first on B2C."
      />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive types are hidden on the B2C and B2B sites."
      />
    </FormDialog>
  )
}
