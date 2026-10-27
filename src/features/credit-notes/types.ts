import type { ActorRef, Channel, IsoDateTime, Paise, PartyRef } from "@/lib/types"

/** A refund documents a B2C return; the credit ledger reduces what a B2B credit customer owes. */
export type CreditNoteAppliedTo = "refund" | "credit_ledger"

export type CreditNote = {
  id: string
  number: string
  channel: Channel
  customer: PartyRef
  orderId: string
  orderNumber: string
  returnId: string | null
  returnNumber: string | null
  reason: string
  taxableAmount: Paise
  gstAmount: Paise
  /** Taxable amount + GST. */
  amount: Paise
  appliedTo: CreditNoteAppliedTo
  issuedAt: IsoDateTime
  issuedBy: ActorRef
}
