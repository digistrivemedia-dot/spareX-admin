"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { SwitchField } from "@/components/ui/SwitchField"
import { TextField } from "@/components/ui/TextField"
import { approveApplicationAction } from "@/features/businesses/actions"
import { approveSchema, type ApproveValues } from "@/features/businesses/schemas"
import { DEFAULT_CREDIT_TERMS_DAYS } from "@/lib/constants"

const DEFAULTS: ApproveValues = {
  discountPercent: "",
  enableCredit: false,
  creditLimit: "",
  termsDays: String(DEFAULT_CREDIT_TERMS_DAYS),
}

/** Approving verifies the business, sets its B2B discount and can turn on credit (off by default). */
export function ApproveDialog({
  applicationId,
  businessName,
}: {
  applicationId: string
  businessName: string
}) {
  const router = useRouter()
  const form = useForm({ resolver: zodResolver(approveSchema), defaultValues: DEFAULTS })
  const enableCredit = useWatch({ control: form.control, name: "enableCredit" })

  return (
    <FormDialog
      trigger={
        <Button>
          <CheckCircle2 aria-hidden />
          Approve
        </Button>
      }
      title={`Approve ${businessName}`}
      description="The business can sign in and order on B2B straight away."
      form={form}
      action={async (values) => {
        const result = await approveApplicationAction(applicationId, values)
        if (result.ok) router.push(`/businesses/${result.data.businessId}`)
        return result
      }}
      successMessage="Business approved"
      submitLabel="Approve"
    >
      <TextField
        control={form.control}
        name="discountPercent"
        label="B2B discount (%)"
        inputMode="decimal"
        description="B2B price = B2C price minus this %, on every product."
      />
      <SwitchField
        control={form.control}
        name="enableCredit"
        label="Enable credit"
        description="Lets the business order now and pay within its credit terms."
      />
      {enableCredit && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="creditLimit"
            label="Credit limit (₹)"
            inputMode="decimal"
          />
          <TextField
            control={form.control}
            name="termsDays"
            label="Terms (days)"
            inputMode="numeric"
          />
        </div>
      )}
    </FormDialog>
  )
}
