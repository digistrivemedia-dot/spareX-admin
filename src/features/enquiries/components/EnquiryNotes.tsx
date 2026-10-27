"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextareaField } from "@/components/ui/TextareaField"
import { addEnquiryNoteAction } from "@/features/enquiries/actions"
import { noteSchema, type NoteValues } from "@/features/enquiries/schemas"
import type { EnquiryNote } from "@/features/enquiries/types"
import { formatDateTime } from "@/lib/format"
import { useActionSubmit } from "@/lib/use-action-submit"

const EMPTY: NoteValues = { text: "" }

type EnquiryNotesProps = { enquiryId: string; notes: EnquiryNote[]; canManage: boolean }

/** Internal notes for the team; the customer never sees them. */
export function EnquiryNotes({ enquiryId, notes, canManage }: EnquiryNotesProps) {
  const form = useForm({ resolver: zodResolver(noteSchema), defaultValues: EMPTY })
  const submit = useActionSubmit(form, (values) => addEnquiryNoteAction(enquiryId, values), {
    successMessage: "Note added",
    onSuccess: () => form.reset(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Internal notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">No notes yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <p className="text-gray-900">{note.text}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {note.by.name} · {formatDateTime(note.at)}
                </p>
              </li>
            ))}
          </ul>
        )}
        {canManage && (
          <form onSubmit={submit} noValidate className="flex flex-col gap-3">
            <TextareaField control={form.control} name="text" label="Add a note" rows={2} />
            <Button
              type="submit"
              variant="outline"
              className="self-end"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
              Add note
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
