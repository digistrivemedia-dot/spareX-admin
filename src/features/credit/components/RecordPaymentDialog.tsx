"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IndianRupee } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import { paymentSchema, type PaymentValues } from "@/features/businesses/schemas"
import { recordPaymentAction } from "@/features/credit/actions"
import { formatPrice } from "@/lib/format"

type RecordPaymentDialogProps = { accountId: string; outstanding: number }

/** Records money received against the account (NEFT, cheque, cash); it settles the oldest invoices first. */
export function RecordPaymentDialog({ accountId, outstanding }: RecordPaymentDialogProps) {
  const values: PaymentValues = {
    amount: outstanding > 0 ? String(outstanding / 100) : "",
    reference: "",
    date: new Date().toISOString().slice(0, 10),
  }
  const form = useForm({ resolver: zodResolver(paymentSchema), values })

  return (
    <FormDialog
      trigger={
        <Button>
          <IndianRupee aria-hidden />
          Record payment
        </Button>
      }
      title="Record payment"
      description={`Outstanding now: ${formatPrice(outstanding)} incl. GST.`}
      form={form}
      action={(data) => recordPaymentAction(accountId, data)}
      successMessage="Payment recorded"
      submitLabel="Record payment"
    >
      <TextField control={form.control} name="amount" label="Amount (₹)" inputMode="decimal" />
      <TextField control={form.control} name="reference" label="UTR, cheque or receipt no." />
      <TextField control={form.control} name="date" label="Received on" type="date" />
    </FormDialog>
  )
}
