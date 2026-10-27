"use client"

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

type SwitchFieldProps<TValues extends FieldValues, TContext, TOutput> = {
  control: Control<TValues, TContext, TOutput>
  name: FieldPath<TValues>
  label: string
  description?: string
}

/** An on / off setting with its label and an explanation of what it does. */
export function SwitchField<TValues extends FieldValues, TContext, TOutput>({
  control,
  name,
  label,
  description,
}: SwitchFieldProps<TValues, TContext, TOutput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field orientation="horizontal" className="rounded-lg border border-gray-200 p-3">
          <FieldContent>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
          <Switch
            id={name}
            checked={field.value === true}
            onCheckedChange={field.onChange}
            onBlur={field.onBlur}
          />
        </Field>
      )}
    />
  )
}
