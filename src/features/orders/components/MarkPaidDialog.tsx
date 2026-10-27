"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IndianRupee } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import { markOrderPaidAction } from "@/features/orders/actions"
import { markPaidSchema, type MarkPaidValues } from "@/features/orders/schemas"
import type { PaymentMethod } from "@/features/orders/types"
import { PAYMENT_METHOD_LABELS } from "@/features/orders/utils"
import { formatPrice } from "@/lib/format"

type MarkPaidDialogProps = {
  orderId: string
  orderNumber: string
  method: PaymentMethod
  amount: number
  size?: "sm" | "default"
}

/** Confirms a bank transfer, cash or collected COD payment with its reference. Razorpay payments mark themselves. */
export function MarkPaidDialog({
  orderId,
  orderNumber,
  method,
  amount,
  size = "default",
}: MarkPaidDialogProps) {
  const values: MarkPaidValues = { reference: "", date: new Date().toISOString().slice(0, 10) }
  const form = useForm({ resolver: zodResolver(markPaidSchema), values })

  return (
    <FormDialog
      trigger={
        <Button size={size} variant={size === "sm" ? "outline" : "default"}>
          <IndianRupee aria-hidden />
          Mark paid
        </Button>
      }
      title={`Mark ${orderNumber} paid`}
      description={`${PAYMENT_METHOD_LABELS[method]} of ${formatPrice(amount)} incl. GST.`}
      form={form}
      action={(data) => markOrderPaidAction(orderId, data)}
      successMessage="Payment confirmed"
      submitLabel="Mark paid"
    >
      <TextField
        control={form.control}
        name="reference"
        label={method === "bank_transfer" ? "UTR number" : "Receipt or reference"}
      />
      <TextField control={form.control} name="date" label="Received on" type="date" />
    </FormDialog>
  )
}
