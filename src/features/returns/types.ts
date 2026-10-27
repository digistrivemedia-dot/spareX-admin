import type { Channel, IsoDate, IsoDateTime, Paise, PartyRef, TimelineEvent } from "@/lib/types"

export type ReturnKind = "return" | "replacement"

/** Request → approve / reject → pickup → verify → refund, credit note or replacement → closed. */
export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "verified"
  | "refunded"
  | "credit_note_issued"
  | "replacement_sent"
  | "closed"

export type ReturnReason =
  "damaged" | "wrong_item" | "does_not_fit" | "defective" | "not_as_described"

export type ItemCondition = "unused" | "opened" | "used" | "damaged"

export type ReturnItem = {
  orderItemId: string
  productId: string
  name: string
  sku: string
  quantity: number
  amount: Paise
}

export type ReturnResolution = {
  type: "refund" | "credit_note" | "replacement"
  amount: Paise
  /** Refund id, credit note number or replacement order number. */
  reference: string
  at: IsoDateTime
}

export type ReturnRequest = {
  id: string
  number: string
  kind: ReturnKind
  channel: Channel
  orderId: string
  orderNumber: string
  customer: PartyRef
  items: ReturnItem[]
  reason: ReturnReason
  customerNote: string
  photos: string[]
  status: ReturnStatus
  rejectionReason: string | null
  pickup: { date: IsoDate; window: string } | null
  verification: {
    condition: ItemCondition
    notes: string
    photos: string[]
    at: IsoDateTime
  } | null
  resolution: ReturnResolution | null
  timeline: TimelineEvent<ReturnStatus>[]
  requestedAt: IsoDateTime
}
