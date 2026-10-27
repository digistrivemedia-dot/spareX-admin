"use client"

import { Plus, Trash2 } from "lucide-react"
import { useFieldArray } from "react-hook-form"

import { FormSection } from "@/components/layout/FormSection"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/TextField"
import type { ProductControl } from "@/features/catalog/schemas"

/** Label / value pairs shown in the product page's specification table. */
export function ProductSpecsSection({ control }: { control: ProductControl }) {
  const { fields, append, remove } = useFieldArray({ control, name: "specs" })

  return (
    <FormSection
      title="Specifications"
      description="e.g. Viscosity: 10W-50, Volume: 1 L."
      columns="one"
    >
      {fields.length === 0 && <p className="text-sm text-gray-500">No specifications yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-3">
          <div className="flex-1">
            <TextField control={control} name={`specs.${index}.label`} label="Spec" />
          </div>
          <div className="flex-1">
            <TextField control={control} name={`specs.${index}.value`} label="Value" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-6"
            onClick={() => remove(index)}
            aria-label={`Remove specification ${index + 1}`}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => append({ label: "", value: "" }, { shouldFocus: true })}
      >
        <Plus aria-hidden />
        Add specification
      </Button>
    </FormSection>
  )
}
