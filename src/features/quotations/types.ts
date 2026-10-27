import type { ActorRef, IsoDate, IsoDateTime, Paise } from "@/lib/types"

export type QuotationStatus =
  "requested" | "sent" | "accepted" | "rejected" | "expired" | "converted"

/** Auto-priced from the product's B2C price and the business's discount %; admin can edit any line. */
export type QuotationLine = {
  id: string
  productId: string
  name: string
  sku: string
  quantity: number
  /** B2C price per unit, incl. GST. */
  listPrice: Paise
  discountPercent: number
  /** Price per unit after the discount, incl. GST. */
  unitPrice: Paise
  total: Paise
}

export type QuotationRevision = {
  version: number
  at: IsoDateTime
  by: ActorRef
  total: Paise
  note: string
}

export type Quotation = {
  id: string
  number: string
  businessId: string
  businessName: string
  requestedBy: ActorRef
  lines: QuotationLine[]
  subtotal: Paise
  /** Extra discount on the whole quotation, on top of the line discounts. */
  extraDiscount: Paise
  total: Paise
  gstAmount: Paise
  status: QuotationStatus
  validUntil: IsoDate | null
  orderId: string | null
  revisions: QuotationRevision[]
  createdAt: IsoDateTime
  sentAt: IsoDateTime | null
}
