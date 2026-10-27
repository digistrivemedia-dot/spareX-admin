"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ClipboardCheck } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { MultiImageField } from "@/components/ui/MultiImageField"
import { SelectField } from "@/components/ui/SelectField"
import { TextareaField } from "@/components/ui/TextareaField"
import { verifyReturnAction } from "@/features/returns/actions"
import { verifySchema, type VerifyValues } from "@/features/returns/schemas"
import { CONDITION_OPTIONS } from "@/features/returns/utils"

/** Records the item's condition once it is back at Kannali, with photos. */
export function VerifyReturnDialog({ returnId }: { returnId: string }) {
  const values: VerifyValues = { condition: "unused", notes: "", photos: [] }
  const form = useForm({ resolver: zodResolver(verifySchema), values })

  return (
    <FormDialog
      trigger={
        <Button>
          <ClipboardCheck aria-hidden />
          Verify item
        </Button>
      }
      title="Verify returned item"
      description="Check the item against the order and the customer's photos."
      form={form}
      action={(data) => verifyReturnAction(returnId, data)}
      successMessage="Item verified"
      submitLabel="Save verification"
    >
      <SelectField
        control={form.control}
        name="condition"
        label="Condition"
        options={CONDITION_OPTIONS}
      />
      <TextareaField control={form.control} name="notes" label="What you checked" />
      <MultiImageField control={form.control} name="photos" label="Photos (optional)" />
    </FormDialog>
  )
}
