"use client"

import type { ComponentProps } from "react"
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFieldProps<TValues extends FieldValues, TContext, TOutput> = {
  control: Control<TValues, TContext, TOutput>
  name: FieldPath<TValues>
  label: string
  description?: string
} & Pick<
  ComponentProps<"input">,
  "type" | "autoComplete" | "placeholder" | "inputMode" | "disabled" | "autoFocus"
>

/** A labelled text input wired to react-hook-form, with its validation message. */
export function TextField<TValues extends FieldValues, TContext, TOutput>({
  control,
  name,
  label,
  description,
  ...inputProps
}: TextFieldProps<TValues, TContext, TOutput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input {...field} {...inputProps} id={name} aria-invalid={fieldState.invalid} />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
