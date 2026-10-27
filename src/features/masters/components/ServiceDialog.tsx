"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { CheckboxGroupField } from "@/components/ui/CheckboxGroupField"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import { saveServiceItemAction } from "@/features/masters/actions"
import { serviceItemSchema, type ServiceItemValues } from "@/features/masters/schemas"
import type { ServiceItem } from "@/features/masters/types"
import { VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"

type ServiceDialogProps = {
  service?: ServiceItem
  categoryOptions: FilterOption[]
  trigger: ReactNode
}

/** A service name garages can offer. Garages set their own prices (Q-08), so there is no price here. */
export function ServiceDialog({ service, categoryOptions, trigger }: ServiceDialogProps) {
  const values: ServiceItemValues = {
    categoryId: service?.categoryId ?? "",
    name: service?.name ?? "",
    description: service?.description ?? "",
    vehicleTypes: service?.vehicleTypes ?? [],
    active: service?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(serviceItemSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={service ? `Edit ${service.name}` : "Add service"}
      description="Garages pick from this list and set their own prices."
      form={form}
      action={(data) => saveServiceItemAction(service?.id ?? null, data)}
      successMessage={service ? "Service saved" : "Service added"}
      submitLabel={service ? "Save" : "Add service"}
    >
      <SelectField
        control={form.control}
        name="categoryId"
        label="Category"
        options={categoryOptions}
      />
      <TextField control={form.control} name="name" label="Service name" />
      <TextareaField control={form.control} name="description" label="What's included" />
      <CheckboxGroupField
        control={form.control}
        name="vehicleTypes"
        label="Vehicle types"
        options={VEHICLE_TYPE_OPTIONS}
      />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive services can't be offered or booked."
      />
    </FormDialog>
  )
}
