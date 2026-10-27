import type { Address, Channel, IsoDateTime, Paise, PartyRef, TimelineEvent } from "@/lib/types"

/** Set by admin, in this order (+ cancelled). Customers can cancel until the order is shipped. */
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

/** Razorpay methods are marked paid automatically; the rest are marked paid by admin with a reference. */
export type PaymentMethod =
  "upi" | "card" | "netbanking" | "wallet" | "bank_transfer" | "cash" | "cod" | "credit"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded"

export type OrderPayment = {
  method: PaymentMethod
  status: PaymentStatus
  gateway: "razorpay" | "offline"
  /** Razorpay payment id, or the reference admin typed (UTR, receipt number). */
  reference: string | null
  paidAt: IsoDateTime | null
  refundedAmount: Paise
}

export type OrderItem = {
  id: string
  productId: string
  name: string
  sku: string
  quantity: number
  mrp: Paise
  /** Price per unit actually charged, incl. GST (B2B prices already have the discount applied). */
  unitPrice: Paise
  gstRate: number
  total: Paise
}

/** Typed by admin when marking an order shipped; there is no courier integration. */
export type Shipment = {
  courier: string
  trackingNumber: string
  shippedAt: IsoDateTime
}

export type Order = {
  id: string
  number: string
  channel: Channel
  customer: PartyRef
  /** GSTIN on the invoice (B2B, or a B2C customer who added one). */
  gstin: string | null
  items: OrderItem[]
  subtotal: Paise
  discount: Paise
  deliveryCharge: Paise
  total: Paise
  gstAmount: Paise
  status: OrderStatus
  payment: OrderPayment
  shippingAddress: Address
  shipment: Shipment | null
  cancellationReason: string | null
  invoiceNumber: string | null
  quotationId: string | null
  timeline: TimelineEvent<OrderStatus>[]
  placedAt: IsoDateTime
}

/** One order's payment, as listed on the payments screen. */
export type PaymentRow = {
  orderId: string
  orderNumber: string
  orderStatus: OrderStatus
  channel: Channel
  customer: PartyRef
  method: PaymentMethod
  gateway: OrderPayment["gateway"]
  status: PaymentStatus
  amount: Paise
  refundedAmount: Paise
  reference: string | null
  paidAt: IsoDateTime | null
  placedAt: IsoDateTime
  /** Bank transfer, cash or collected COD that admin must mark paid. */
  needsConfirmation: boolean
}
