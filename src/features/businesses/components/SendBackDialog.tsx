"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Undo2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { CheckboxGroupField } from "@/components/ui/CheckboxGroupField"
import { FormDialog } from "@/components/ui/FormDialog"
import { TextareaField } from "@/components/ui/TextareaField"
import { sendBackApplicationAction } from "@/features/businesses/actions"
import { sendBackSchema, type SendBackValues } from "@/features/businesses/schemas"
import { CORRECTABLE_FIELDS } from "@/features/businesses/utils"

const DEFAULTS: SendBackValues = { fields: [], note: "" }

/** Asks the applicant to correct specific fields; they resubmit from the B2B site. */
export function SendBackDialog({ applicationId }: { applicationId: string }) {
  const form = useForm({ resolver: zodResolver(sendBackSchema), defaultValues: DEFAULTS })

  return (
    <FormDialog
      trigger={
        <Button variant="outline">
          <Undo2 aria-hidden />
          Send back
        </Button>
      }
      title="Send back for corrections"
      description="The applicant sees these fields highlighted and your note."
      form={form}
      action={(values) => sendBackApplicationAction(applicationId, values)}
      successMessage="Sent back to the applicant"
      submitLabel="Send back"
    >
      <CheckboxGroupField
        control={form.control}
        name="fields"
        label="What needs correcting"
        options={CORRECTABLE_FIELDS}
      />
      <TextareaField control={form.control} name="note" label="Note to the applicant" rows={3} />
    </FormDialog>
  )
}
