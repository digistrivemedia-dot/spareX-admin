"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import type { FilterOption } from "@/components/ui/FilterSelect"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SimpleSelectProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  placeholder?: string
  disabled?: boolean
}

/** A labelled select held in local state, for pickers that aren't part of a form's saved values. */
export function SimpleSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
}: SimpleSelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
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
    </Field>
  )
}
