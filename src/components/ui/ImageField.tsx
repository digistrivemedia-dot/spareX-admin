"use client"

import { useState } from "react"
import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldError } from "@/components/ui/field"
import { Upload, type UploadItem } from "@/components/ui/Upload"

type ImageFieldProps<TValues extends FieldValues, TContext, TOutput> = {
  control: Control<TValues, TContext, TOutput>
  name: FieldPath<TValues>
  label: string
}

/** A single image (logo, category picture) with preview. The new file is uploaded when the form is saved. */
export function ImageField<TValues extends FieldValues, TContext, TOutput>({
  control,
  name,
  label,
}: ImageFieldProps<TValues, TContext, TOutput>) {
  const { field, fieldState } = useController({ control, name })
  // Kept locally so a picked file keeps one preview URL instead of a new one on every render. Dialogs unmount
  // their content when closed, so this starts fresh from the saved value each time.
  const [items, setItems] = useState<UploadItem[]>(() =>
    typeof field.value === "string" && field.value
      ? [
          {
            id: "current",
            name: "Current image",
            sizeBytes: 0,
            mimeType: "image/png",
            url: field.value,
          },
        ]
      : [],
  )

  return (
    <Field data-invalid={fieldState.invalid}>
      <Upload
        label={label}
        kind="images"
        value={items}
        onChange={(next) => {
          setItems(next)
          const [first] = next
          field.onChange(first ? (first.file ?? first.url) : null)
        }}
      />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )
}
