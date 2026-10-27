"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { ActionResult } from "@/lib/types"

const reasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Give a short reason (at least 5 characters).")
    .max(500, "Keep it under 500 characters."),
})

type ReasonDialogProps = {
  trigger: ReactNode
  title: string
  description: ReactNode
  confirmLabel: string
  /** Label above the text box, e.g. "Reason for rejection". */
  reasonLabel?: string
  /** One-tap reasons that fill the text box. */
  suggestions?: string[]
  destructive?: boolean
  onConfirm: (reason: string) => Promise<ActionResult<unknown>>
  successMessage: string
}

/** For actions that need a recorded reason: reject, cancel, send back, hold, stock adjustment. */
export function ReasonDialog({
  trigger,
  title,
  description,
  confirmLabel,
  reasonLabel = "Reason",
  suggestions = [],
  destructive,
  onConfirm,
  successMessage,
}: ReasonDialogProps) {
  const [open, setOpen] = useState(false)
  const form = useForm({ resolver: zodResolver(reasonSchema), defaultValues: { reason: "" } })
  const { isSubmitting } = form.formState

  const submit = form.handleSubmit(async ({ reason }) => {
    const result = await onConfirm(reason)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(successMessage)
    form.reset()
    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => form.setValue("reason", suggestion, { shouldValidate: true })}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reason">{reasonLabel}</FieldLabel>
                <Textarea {...field} id="reason" rows={4} aria-invalid={fieldState.invalid} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
