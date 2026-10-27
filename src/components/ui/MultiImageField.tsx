"use client"

import { useState } from "react"
import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form"

import { Field, FieldError } from "@/components/ui/field"
import { Upload, type UploadItem } from "@/components/ui/Upload"

type MultiImageFieldProps<TValues extends FieldValues, TContext, TOutput> = {
  control: Control<TValues, TContext, TOutput>
  name: FieldPath<TValues>
  label: string
}

/** Several images (product photos). Values are stored URLs or newly picked files, uploaded on save. */
export function MultiImageField<TValues extends FieldValues, TContext, TOutput>({
  control,
  name,
  label,
}: MultiImageFieldProps<TValues, TContext, TOutput>) {
  const { field, fieldState } = useController({ control, name })
  // Kept locally so each picked file keeps one preview URL across renders.
  const [items, setItems] = useState<UploadItem[]>(() =>
    ((field.value ?? []) as (string | File)[])
      .filter((value): value is string => typeof value === "string")
      .map((url, index) => ({
        id: `saved-${index}`,
        name: `Image ${index + 1}`,
        sizeBytes: 0,
        mimeType: "image/png",
        url,
      })),
  )

  return (
    <Field data-invalid={fieldState.invalid}>
      <Upload
        label={label}
        kind="images"
        multiple
        value={items}
        onChange={(next) => {
          setItems(next)
          field.onChange(next.map((item) => item.file ?? item.url))
        }}
      />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )
}
