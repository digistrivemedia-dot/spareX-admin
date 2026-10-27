"use client"

import { FormSection } from "@/components/layout/FormSection"
import { TextField } from "@/components/ui/TextField"
import type { ProductControl } from "@/features/catalog/schemas"

export function ProductShippingSection({ control }: { control: ProductControl }) {
  return (
    <FormSection
      title="Size, weight and warranty"
      description="Used for delivery charges and the product page."
    >
      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        <TextField control={control} name="lengthMm" label="Length (mm)" inputMode="numeric" />
        <TextField control={control} name="widthMm" label="Width (mm)" inputMode="numeric" />
        <TextField control={control} name="heightMm" label="Height (mm)" inputMode="numeric" />
      </div>
      <TextField control={control} name="weightGrams" label="Weight (g)" inputMode="numeric" />
      <TextField
        control={control}
        name="warrantyMonths"
        label="Warranty (months)"
        inputMode="numeric"
        description="0 for no warranty."
      />
    </FormSection>
  )
}
