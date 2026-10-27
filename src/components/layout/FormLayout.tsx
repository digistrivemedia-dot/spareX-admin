"use client"

import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, type ReactNode } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import type { ActionResult } from "@/lib/types"
import { useActionSubmit } from "@/lib/use-action-submit"

type FormLayoutProps<TInput extends FieldValues, TOutput> = {
  form: UseFormReturn<TInput, unknown, TOutput>
  /** The server action. Its field errors are shown under the matching inputs. */
  action: (values: TInput) => Promise<ActionResult<unknown>>
  successMessage: string
  submitLabel?: string
  /** Where Cancel goes. Without it, Cancel resets the form. */
  cancelHref?: string
  /** Clears the form after a successful save instead of keeping the saved values (e.g. password forms). */
  resetOnSuccess?: boolean
  children: ReactNode
}

/** Every edit form: sections, zod validation, save / cancel in a sticky bar, and a warning before losing changes. */
export function FormLayout<TInput extends FieldValues, TOutput>({
  form,
  action,
  successMessage,
  submitLabel = "Save changes",
  cancelHref,
  resetOnSuccess = false,
  children,
}: FormLayoutProps<TInput, TOutput>) {
  const { isDirty, isSubmitting } = form.formState

  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty])

  const submit = useActionSubmit(form, action, {
    successMessage,
    onSuccess: () => form.reset(resetOnSuccess ? undefined : form.getValues()),
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {children}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm">
        {isDirty && (
          <p className="mr-auto hidden text-sm text-gray-500 sm:block">You have unsaved changes.</p>
        )}
        {cancelHref ? (
          <Button variant="outline" asChild>
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isSubmitting}
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
