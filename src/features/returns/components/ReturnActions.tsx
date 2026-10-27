"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ReasonDialog } from "@/components/ui/ReasonDialog"
import {
  approveReturnAction,
  closeReturnAction,
  rejectReturnAction,
  resolveReturnAction,
} from "@/features/returns/actions"
import { SchedulePickupDialog } from "@/features/returns/components/SchedulePickupDialog"
import { VerifyReturnDialog } from "@/features/returns/components/VerifyReturnDialog"
import type { ReturnRequest, ReturnResolution } from "@/features/returns/types"
import { isResolved, RESOLUTION_LABELS } from "@/features/returns/utils"
import { formatPrice } from "@/lib/format"

type ReturnActionsProps = {
  request: ReturnRequest
  resolution: ReturnResolution["type"]
  amount: number
}

const RESOLUTION_DESCRIPTIONS: Record<ReturnResolution["type"], string> = {
  refund:
    "The amount goes back to the customer's original payment method, documented by a credit note.",
  credit_note: "A credit note is issued and reduces what the business owes on its credit account.",
  replacement: "A replacement is sent against the same order, at no charge.",
}

/** The one next step for the request, at whatever stage it is. */
export function ReturnActions({ request, resolution, amount }: ReturnActionsProps) {
  const { id, number, status } = request

  if (status === "requested") {
    return (
      <>
        <ReasonDialog
          trigger={<Button variant="outline">Reject</Button>}
          title={`Reject ${number}?`}
          description="The customer sees your reason."
          reasonLabel="Reason for rejecting"
          suggestions={["Outside the return window", "Item was used", "Fitment was correct"]}
          confirmLabel="Reject request"
          destructive
          onConfirm={(reason) => rejectReturnAction(id, reason)}
          successMessage="Request rejected"
        />
        <ConfirmDialog
          trigger={<Button>Approve</Button>}
          title={`Approve ${number}?`}
          description="Next you schedule the pickup."
          confirmLabel="Approve"
          onConfirm={() => approveReturnAction(id)}
          successMessage="Request approved"
        />
      </>
    )
  }
  if (status === "approved") return <SchedulePickupDialog returnId={id} />
  if (status === "pickup_scheduled") return <VerifyReturnDialog returnId={id} />
  if (status === "verified") {
    const label = `${RESOLUTION_LABELS[resolution]}${resolution === "replacement" ? "" : ` ${formatPrice(amount)}`}`
    return (
      <ConfirmDialog
        trigger={<Button>{label}</Button>}
        title={`${label}?`}
        description={RESOLUTION_DESCRIPTIONS[resolution]}
        confirmLabel={label}
        onConfirm={() => resolveReturnAction(id)}
        successMessage={
          resolution === "replacement"
            ? "Replacement sent"
            : `${RESOLUTION_LABELS[resolution]} issued`
        }
      />
    )
  }
  if (isResolved(status)) {
    return (
      <ConfirmDialog
        trigger={<Button variant="outline">Close request</Button>}
        title={`Close ${number}?`}
        description="Closed requests can't be changed."
        confirmLabel="Close request"
        onConfirm={() => closeReturnAction(id)}
        successMessage="Request closed"
      />
    )
  }
  return null
}
