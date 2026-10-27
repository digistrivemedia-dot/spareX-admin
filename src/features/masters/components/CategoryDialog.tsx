"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import type { FilterOption } from "@/components/ui/FilterSelect"
import { FormDialog } from "@/components/ui/FormDialog"
import { ImageField } from "@/components/ui/ImageField"
import { SelectField } from "@/components/ui/SelectField"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { saveProductCategoryAction } from "@/features/masters/actions"
import { productCategorySchema, type ProductCategoryValues } from "@/features/masters/schemas"
import type { ProductCategory } from "@/features/masters/types"
import { TOP_LEVEL } from "@/features/masters/utils"

type CategoryDialogProps = {
  category?: ProductCategory
  /** Top-level categories a subcategory can sit under. */
  parentOptions: FilterOption[]
  trigger: ReactNode
}

export function CategoryDialog({ category, parentOptions, trigger }: CategoryDialogProps) {
  const values: ProductCategoryValues = {
    name: category?.name ?? "",
    parentId: category?.parentId ?? TOP_LEVEL,
    image: category?.imageUrl ?? null,
    sortOrder: String(category?.sortOrder ?? 1),
    active: category?.active ?? true,
  }
  const form = useForm({ resolver: zodResolver(productCategorySchema), values })
  const options = [
    { value: TOP_LEVEL, label: "None (top-level category)" },
    ...parentOptions.filter((option) => option.value !== category?.id),
  ]

  return (
    <FormDialog
      trigger={trigger}
      title={category ? `Edit ${category.name}` : "Add category"}
      form={form}
      action={(data) => saveProductCategoryAction(category?.id ?? null, data)}
      successMessage={category ? "Category saved" : "Category added"}
      submitLabel={category ? "Save" : "Add category"}
    >
      <TextField control={form.control} name="name" label="Name" />
      <SelectField
        control={form.control}
        name="parentId"
        label="Parent category"
        options={options}
      />
      <TextField
        control={form.control}
        name="sortOrder"
        label="Order"
        inputMode="numeric"
        description="Lower numbers show first in B2C menus."
      />
      <ImageField control={form.control} name="image" label="Image" />
      <SwitchField
        control={form.control}
        name="active"
        label="Active"
        description="Inactive categories and their products are hidden on B2C and B2B."
      />
    </FormDialog>
  )
}
