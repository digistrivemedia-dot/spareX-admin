"use client"

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import type { FilterOption } from "@/components/ui/FilterSelect"

type CheckboxGroupFieldProps<TValues extends FieldValues, TContext, TOutput> = {
  control: Control<TValues, TContext, TOutput>
  name: FieldPath<TValues>
  label: string
  options: FilterOption[]
}

/** Pick several options; the value is an array of option values. */
export function CheckboxGroupField<TValues extends FieldValues, TContext, TOutput>({
  control,
  name,
  label,
  options,
}: CheckboxGroupFieldProps<TValues, TContext, TOutput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected: string[] = field.value ?? []
        const toggle = (value: string, checked: boolean) =>
          field.onChange(checked ? [...selected, value] : selected.filter((item) => item !== value))
        return (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend variant="label">{label}</FieldLegend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {options.map((option) => {
                const id = `${name}-${option.value}`
                return (
                  <Field key={option.value} orientation="horizontal" className="w-auto">
                    <Checkbox
                      id={id}
                      checked={selected.includes(option.value)}
                      onCheckedChange={(checked) => toggle(option.value, checked === true)}
                    />
                    <FieldLabel htmlFor={id} className="font-normal">
                      {option.label}
                    </FieldLabel>
                  </Field>
                )
              })}
            </div>
            <FieldError errors={[fieldState.error]} />
          </FieldSet>
        )
      }}
    />
  )
}
