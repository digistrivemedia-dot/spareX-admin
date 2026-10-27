"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/FormDialog"
import { TextField } from "@/components/ui/TextField"
import { settlePayoutAction } from "@/features/garages/actions"
import type { GaragePayout } from "@/features/garages/types"
import { formatPrice } from "@/lib/format"

const schema = z.object({ reference: z.string().trim().min(3, "Enter the UTR or bank reference.") })
const DEFAULTS = { reference: "" }

/** Marks everything due to a partner garage as paid, with the bank reference. */
export function SettlePayoutDialog({ payout }: { payout: GaragePayout }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: DEFAULTS })

  return (
    <FormDialog
      trigger={
        <Button size="sm" variant="outline" disabled={payout.unsettledAmount === 0}>
          Mark settled
        </Button>
      }
      title={`Settle ${payout.garageName}`}
      description={`${formatPrice(payout.unsettledAmount)} for ${payout.unsettledCount} online service payment${payout.unsettledCount === 1 ? "" : "s"}.`}
      form={form}
      action={(values) => settlePayoutAction(payout.garageId, values.reference)}
      successMessage="Payout settled"
      submitLabel="Mark settled"
    >
      <TextField control={form.control} name="reference" label="UTR or bank reference" />
    </FormDialog>
  )
}
