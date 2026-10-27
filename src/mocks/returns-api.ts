import "server-only"

import type { CreditNote } from "@/features/credit-notes/types"
import type { PickupInput, VerifyInput } from "@/features/returns/schemas"
import type { ReturnRequest, ReturnStatus } from "@/features/returns/types"
import {
  RESOLUTION_LABELS,
  RESOLVED_STATUS,
  isResolved,
  resolutionFor,
  returnAmount,
} from "@/features/returns/utils"
import { ApiError } from "@/lib/api-client"
import { formatDate, formatPrice, humanize } from "@/lib/format"
import { splitInclusiveGst } from "@/lib/gst"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { creditAccounts, refreshTotals } from "@/mocks/credit"
import { orders } from "@/mocks/orders"
import { creditNoteNumber, creditNotes, returns } from "@/mocks/returns"
import { delay, listEndpoint, newId } from "@/mocks/utils"

/** Requests waiting for admin come first: new ones to approve, then verified ones to settle. */
const ATTENTION: Partial<Record<ReturnStatus, number>> = {
  requested: 0,
  verified: 1,
  approved: 2,
  pickup_scheduled: 3,
}

export const returnEndpoint = listEndpoint<ReturnRequest>(() => returns, {
  searchText: (row) =>
    `${row.number} ${row.orderNumber} ${row.customer.name} ${row.items.map((item) => item.name).join(" ")}`,
  date: (row) => row.requestedAt,
  filters: {
    status: (row, value) => row.status === value,
    kind: (row, value) => row.kind === value,
    channel: (row, value) => row.channel === value,
    reason: (row, value) => row.reason === value,
  },
  sortValues: {
    requestedAt: (row) => row.requestedAt,
    amount: returnAmount,
    attention: (row) => ATTENTION[row.status] ?? 9,
  },
})

export async function getReturn(id: string): Promise<ReturnRequest | null> {
  await delay()
  return returns.find((candidate) => candidate.id === id) ?? null
}

/** Moves a request one step, checking it is at the step the action expects. */
function advance(
  actor: ActorRef,
  id: string,
  from: ReturnStatus[],
  to: ReturnStatus,
  note?: string,
): ReturnRequest {
  const request = returns.find((candidate) => candidate.id === id)
  if (!request) throw new ApiError("Return not found.", 404)
  if (!from.includes(request.status)) {
    throw new ApiError(`This request is already ${humanize(request.status).toLowerCase()}.`, 409)
  }
  const before = request.status
  request.status = to
  request.timeline.push({ status: to, at: new Date().toISOString(), by: actor, note })
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "return",
    entityId: request.id,
    entityLabel: request.number,
    summary: note ? `${humanize(to)}: ${note}` : humanize(to),
    changes: [{ field: "Status", before: humanize(before), after: humanize(to) }],
  })
  return request
}

export async function approveReturn(actor: ActorRef, id: string) {
  await delay()
  advance(actor, id, ["requested"], "approved")
}

export async function rejectReturn(actor: ActorRef, id: string, reason: string) {
  await delay()
  advance(actor, id, ["requested"], "rejected", reason).rejectionReason = reason
}

export async function schedulePickup(actor: ActorRef, id: string, pickup: PickupInput) {
  await delay()
  const note = `${formatDate(pickup.date)}, ${pickup.window}`
  advance(actor, id, ["approved"], "pickup_scheduled", note).pickup = pickup
}

export async function verifyReturn(actor: ActorRef, id: string, input: VerifyInput) {
  await delay()
  const request = advance(actor, id, ["pickup_scheduled"], "verified", humanize(input.condition))
  request.verification = { ...input, at: new Date().toISOString() }
}

export async function closeReturn(actor: ActorRef, id: string) {
  await delay()
  const request = returns.find((candidate) => candidate.id === id)
  if (!request || !isResolved(request.status)) {
    throw new ApiError("Only resolved requests can be closed.", 409)
  }
  advance(actor, id, [request.status], "closed")
}

/** Refund (B2C), credit note on the credit ledger (B2B credit orders) or replacement, as `resolutionFor` decides. */
export async function resolveReturn(actor: ActorRef, id: string) {
  await delay()
  const request = returns.find((candidate) => candidate.id === id)
  const order = orders.find((candidate) => candidate.id === request?.orderId)
  if (!request || !order) throw new ApiError("Return not found.", 404)
  if (request.status !== "verified") throw new ApiError("Verify the item first.", 409)

  const type = resolutionFor(request.kind, order.payment.method)
  const amount = returnAmount(request)
  const now = new Date().toISOString()
  const reference =
    type === "replacement"
      ? `${order.number}-R`
      : issueCreditNote(actor, request, amount, type === "credit_note").number

  if (type === "refund" && order.payment.status !== "pending") {
    const refundedAmount = order.payment.refundedAmount + amount
    order.payment = {
      ...order.payment,
      refundedAmount,
      status: refundedAmount >= order.total ? "refunded" : "partially_refunded",
    }
  }
  request.resolution = { type, amount, reference, at: now }
  advance(actor, id, ["verified"], RESOLVED_STATUS[type], `${RESOLUTION_LABELS[type]} ${reference}`)
}

function issueCreditNote(
  actor: ActorRef,
  request: ReturnRequest,
  amount: number,
  toLedger: boolean,
): CreditNote {
  const number = creditNoteNumber(creditNotes.length + 1)
  const { taxable, gst } = splitInclusiveGst(amount)
  const note: CreditNote = {
    id: `cn_${number.slice(-4)}`,
    number,
    channel: request.channel,
    customer: request.customer,
    orderId: request.orderId,
    orderNumber: request.orderNumber,
    returnId: request.id,
    returnNumber: request.number,
    reason: `Return ${request.number}: ${request.customerNote}`,
    taxableAmount: taxable,
    gstAmount: gst,
    amount,
    appliedTo: toLedger ? "credit_ledger" : "refund",
    issuedAt: new Date().toISOString(),
    issuedBy: actor,
  }
  creditNotes.push(note)

  const account = creditAccounts.find((candidate) => candidate.businessId === request.customer.id)
  if (toLedger && account) {
    account.ledger.push({
      id: newId("led"),
      type: "credit_note",
      at: note.issuedAt,
      reference: number,
      orderId: request.orderId,
      amount: -amount,
      dueOn: null,
      note: note.reason,
      by: actor,
    })
    refreshTotals(account)
  }
  recordAuditEntry(actor, {
    action: "create",
    entity: "credit_note",
    entityId: note.id,
    entityLabel: number,
    summary: `Issued for ${request.number} (${toLedger ? "credit ledger" : "refund"})`,
    changes: [{ field: "Amount", before: "", after: formatPrice(amount) }],
  })
  return note
}
