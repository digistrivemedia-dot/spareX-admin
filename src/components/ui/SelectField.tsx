"use client"

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import type { FilterOption } from "@/components/ui/FilterSelect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectFieldProps<TValues extends FieldValues, TContext, TOutput> = {
  control: Control<TValues, TContext, TOutput>
  name: FieldPath<TValues>
  label: string
  options: FilterOption[]
  placeholder?: string
  description?: string
  disabled?: boolean
}

/** A labelled select wired to react-hook-form. The value is the option's `value` string. */
export function SelectField<TValues extends FieldValues, TContext, TOutput>({
  control,
  name,
  label,
  options,
  placeholder = "Select…",
  description,
  disabled,
}: SelectFieldProps<TValues, TContext, TOutput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger
              id={name}
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
              className="w-full"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
