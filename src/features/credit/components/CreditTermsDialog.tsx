"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import { creditTermsSchema, type CreditTermsValues } from "@/features/businesses/schemas"
import { enableCreditAction, updateCreditTermsAction } from "@/features/credit/actions"
import { DEFAULT_CREDIT_TERMS_DAYS } from "@/lib/constants"

type CreditTermsDialogProps =
  | { mode: "enable"; businessId: string; businessName: string; trigger: ReactNode }
  | {
      mode: "edit"
      accountId: string
      businessName: string
      limit: number
      termsDays: number
      trigger: ReactNode
    }

/** Turns credit on for a business, or changes an account's limit and terms. */
export function CreditTermsDialog(props: CreditTermsDialogProps) {
  const values: CreditTermsValues =
    props.mode === "edit"
      ? { limit: String(props.limit / 100), termsDays: String(props.termsDays) }
      : { limit: "", termsDays: String(DEFAULT_CREDIT_TERMS_DAYS) }
  const form = useForm({ resolver: zodResolver(creditTermsSchema), values })

  return (
    <FormDialog
      trigger={props.trigger}
      title={
        props.mode === "enable"
          ? `Enable credit for ${props.businessName}`
          : "Credit limit and terms"
      }
      description="The business can order on credit up to the limit and pays each invoice within the terms."
      form={form}
      action={(data) =>
        props.mode === "enable"
          ? enableCreditAction(props.businessId, data)
          : updateCreditTermsAction(props.accountId, data)
      }
      successMessage={props.mode === "enable" ? "Credit enabled" : "Credit terms saved"}
      submitLabel={props.mode === "enable" ? "Enable credit" : "Save"}
    >
      <TextField control={form.control} name="limit" label="Credit limit (₹)" inputMode="decimal" />
      <TextField
        control={form.control}
        name="termsDays"
        label="Terms (days)"
        inputMode="numeric"
        description={`Net ${DEFAULT_CREDIT_TERMS_DAYS} is the default.`}
      />
    </FormDialog>
  )
}
