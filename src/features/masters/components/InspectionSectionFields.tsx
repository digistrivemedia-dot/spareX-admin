"use client"

import { Plus, Trash2 } from "lucide-react"
import { Controller, useFieldArray, type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { InspectionTemplateValues } from "@/features/masters/schemas"

type InspectionSectionFieldsProps = {
  control: Control<InspectionTemplateValues, unknown, unknown>
  index: number
  title: string
}

/** One section of the checklist (Engine, Brakes…): its checks, which can be renamed, added and removed. */
export function InspectionSectionFields({ control, index, title }: InspectionSectionFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `sections.${index}.items` })

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">{fields.length} checks</span>
      </div>
      <ul className="flex flex-col gap-2">
        {fields.map((item, itemIndex) => (
          <li key={item.id}>
            <Controller
              control={control}
              name={`sections.${index}.items.${itemIndex}.label`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    {title} check {itemIndex + 1}
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(itemIndex)}
                      disabled={fields.length === 1}
                      aria-label={`Remove ${field.value || "check"}`}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => append({ id: "", label: "" }, { shouldFocus: true })}
      >
        <Plus aria-hidden />
        Add check
      </Button>
    </section>
  )
}
