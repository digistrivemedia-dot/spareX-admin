"use client"

import type { FieldValues, Path, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import type { ActionResult } from "@/lib/types"

type Options = {
  successMessage: string
  /** Runs after a successful save, e.g. to close a dialog or reset the form. */
  onSuccess?: () => void
}

/**
 * The submit handler every form uses: validates on the client, sends the raw values to the server action (which
 * validates them again with the same schema), shows server field errors under their inputs, and toasts the result.
 */
export function useActionSubmit<TInput extends FieldValues, TOutput>(
  form: UseFormReturn<TInput, unknown, TOutput>,
  action: (values: TInput) => Promise<ActionResult<unknown>>,
  { successMessage, onSuccess }: Options,
) {
  return form.handleSubmit(async () => {
    const result = await action(form.getValues())
    if (!result.ok) {
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as Path<TInput>, { message: messages[0] })
      }
      toast.error(result.error)
      return
    }
    toast.success(successMessage)
    onSuccess?.()
  })
}
