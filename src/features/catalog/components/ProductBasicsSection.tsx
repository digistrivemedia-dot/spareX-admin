"use client"

import { useWatch } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { CheckboxGroupField } from "@/components/ui/CheckboxGroupField"
import { SelectField } from "@/components/ui/SelectField"
import { TextareaField } from "@/components/ui/TextareaField"
import { TextField } from "@/components/ui/TextField"
import type { ProductFormOptions } from "@/features/catalog/api"
import type { ProductControl } from "@/features/catalog/schemas"
import { NO_SUBCATEGORY } from "@/features/catalog/utils"
import { VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"

type ProductBasicsSectionProps = {
  control: ProductControl
  options: Pick<ProductFormOptions, "categories" | "partBrands">
}

export function ProductBasicsSection({ control, options }: ProductBasicsSectionProps) {
  const categoryId = useWatch({ control, name: "categoryId" })
  const toOption = (item: { id: string; name: string }) => ({ value: item.id, label: item.name })
  const categories = options.categories.filter((category) => category.parentId === null)
  const subcategories = [
    { value: NO_SUBCATEGORY, label: "None" },
    ...options.categories.filter((category) => category.parentId === categoryId).map(toOption),
  ]

  return (
    <FormSection title="Product details">
      <div className="md:col-span-2">
        <TextField control={control} name="name" label="Product name" />
      </div>
      <SelectField
        control={control}
        name="categoryId"
        label="Category"
        options={categories.map(toOption)}
      />
      <SelectField
        control={control}
        name="subcategoryId"
        label="Subcategory"
        options={subcategories}
        disabled={!categoryId}
      />
      <SelectField
        control={control}
        name="partBrandId"
        label="Part brand"
        options={options.partBrands.filter((brand) => brand.active).map(toOption)}
      />
      <CheckboxGroupField
        control={control}
        name="vehicleTypes"
        label="Vehicle types"
        options={VEHICLE_TYPE_OPTIONS}
      />
      <div className="md:col-span-2">
        <TextareaField control={control} name="description" label="Description" rows={4} />
      </div>
    </FormSection>
  )
}
