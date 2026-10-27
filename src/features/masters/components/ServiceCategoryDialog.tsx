"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { saveServiceCategoryAction } from "@/features/masters/actions"
import { serviceCategorySchema, type ServiceCategoryValues } from "@/features/masters/schemas"
import type { ServiceCategory } from "@/features/masters/types"

export function ServiceCategoryDialog({
  category,
  trigger,
}: {
  category?: ServiceCategory
  trigger: ReactNode
}) {
  const values: ServiceCategoryValues = {
    name: category?.name ?? "",
    sortOrder: String(category?.sortOrder ?? 1),
    active: category?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(serviceCategorySchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={category ? `Edit ${category.name}` : "Add service category"}
      form={form}
      action={(data) => saveServiceCategoryAction(category?.id ?? null, data)}
      successMessage={category ? "Service category saved" : "Service category added"}
      submitLabel={category ? "Save" : "Add category"}
    >
      <TextField control={form.control} name="name" label="Name" />
      <TextField control={form.control} name="sortOrder" label="Order" inputMode="numeric" />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Garages can't offer services from an inactive category."
      />
    </FormDialog>
  )
}
