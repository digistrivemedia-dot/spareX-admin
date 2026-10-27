"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import { setDiscountAction } from "@/features/pricing/actions"
import { discountSchema, type DiscountValues } from "@/features/pricing/schemas"
import { MAX_B2B_DISCOUNT_PERCENT } from "@/lib/constants"

type DiscountDialogProps = {
  businessIds: string[]
  /** "Sri Sai Two Wheeler Works", or "3 businesses" for a bulk edit. */
  label: string
  current: number | null
  trigger: ReactNode
  onDone?: () => void
}

/** Sets the B2B discount: B2B price = B2C price minus this %, on every product. */
export function DiscountDialog({
  businessIds,
  label,
  current,
  trigger,
  onDone,
}: DiscountDialogProps) {
  const values: DiscountValues = { businessIds, percent: current === null ? "" : String(current) }
  const form = useForm({ resolver: zodResolver(discountSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={`B2B discount for ${label}`}
      description="Applies to every product. Prices include GST; open quotations keep their prices."
      form={form}
      action={async (data) => {
        const result = await setDiscountAction(data)
        if (result.ok) onDone?.()
        return result
      }}
      successMessage="Discount saved"
    >
      <TextField
        control={form.control}
        name="percent"
        label="Discount (%)"
        inputMode="decimal"
        description={`From 0 to ${MAX_B2B_DISCOUNT_PERCENT}%.`}
      />
    </FormDialog>
  )
}
