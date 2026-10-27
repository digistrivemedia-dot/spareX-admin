"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextareaField } from "@/components/ui/TextareaField"
import { replyToEnquiryAction } from "@/features/enquiries/actions"
import { replySchema, type ReplyValues } from "@/features/enquiries/schemas"
import type { Enquiry } from "@/features/enquiries/types"
import { formatDateTime } from "@/lib/format"
import { useActionSubmit } from "@/lib/use-action-submit"

const EMPTY: ReplyValues = { text: "", resolve: true }

/** The reply the customer receives, and the form to send (or replace) it. */
export function EnquiryReplyForm({ enquiry, canManage }: { enquiry: Enquiry; canManage: boolean }) {
  const form = useForm({ resolver: zodResolver(replySchema), defaultValues: EMPTY })
  const submit = useActionSubmit(form, (values) => replyToEnquiryAction(enquiry.id, values), {
    successMessage: "Reply sent",
    onSuccess: () => form.reset(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Reply to customer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {enquiry.reply && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            <p className="text-gray-900">{enquiry.reply.text}</p>
            <p className="mt-1 text-xs text-gray-500">
              Sent by {enquiry.reply.by.name} · {formatDateTime(enquiry.reply.at)}
            </p>
          </div>
        )}
        {canManage && (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <TextareaField
              control={form.control}
              name="text"
              label={enquiry.reply ? "Send another reply" : "Reply"}
              rows={4}
            />
            <SwitchField
              control={form.control}
              name="resolve"
              label="Mark resolved"
              description="Turn off if you still need to add the vehicle or fitment."
            />
            <Button type="submit" className="self-end" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                <Send aria-hidden />
              )}
              Send reply
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
