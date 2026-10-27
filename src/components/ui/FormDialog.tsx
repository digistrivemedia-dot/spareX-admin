"use client"

import { Loader2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ActionResult } from "@/lib/types"
import { useActionSubmit } from "@/lib/use-action-submit"

type FormDialogProps<TInput extends FieldValues, TOutput> = {
  trigger: ReactNode
  title: string
  description?: string
  form: UseFormReturn<TInput, unknown, TOutput>
  action: (values: TInput) => Promise<ActionResult<unknown>>
  successMessage: string
  submitLabel?: string
  children: ReactNode
}

/** Create or edit a small record in a dialog: validation, server field errors, toast, and a clean form on close. */
export function FormDialog<TInput extends FieldValues, TOutput>({
  trigger,
  title,
  description,
  form,
  action,
  successMessage,
  submitLabel = "Save",
  children,
}: FormDialogProps<TInput, TOutput>) {
  const [open, setOpen] = useState(false)
  const { isSubmitting } = form.formState

  function changeOpen(next: boolean) {
    if (isSubmitting) return
    if (!next) form.reset()
    setOpen(next)
  }

  const submit = useActionSubmit(form, action, {
    successMessage,
    onSuccess: () => {
      setOpen(false)
      form.reset()
    },
  })

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* 90svh keeps long forms scrollable inside the dialog on short phone screens. */}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="flex flex-col gap-4">{children}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
