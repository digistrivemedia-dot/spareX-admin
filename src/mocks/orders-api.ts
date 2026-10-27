import "server-only"

import type { Order, OrderStatus, PaymentRow, Shipment } from "@/features/orders/types"
import { isCancellable, needsConfirmation, nextOrderStatus } from "@/features/orders/utils"
import { ApiError } from "@/lib/api-client"
import { formatPrice, humanize } from "@/lib/format"
import type { ActorRef, IsoDate } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { creditAccounts, refreshTotals } from "@/mocks/credit"
import { orders } from "@/mocks/orders"
import { delay, listEndpoint, newId } from "@/mocks/utils"

const RAZORPAY_REFUND_NOTE = "Refund started to the original payment method"

export const orderEndpoint = listEndpoint<Order>(() => orders, {
  searchText: (row) =>
    `${row.number} ${row.customer.name} ${row.customer.phone} ${row.invoiceNumber ?? ""} ${row.shipment?.trackingNumber ?? ""}`,
  date: (row) => row.placedAt,
  filters: {
    status: (row, value) => row.status === value,
    channel: (row, value) => row.channel === value,
    payment: (row, value) => row.payment.status === value,
    method: (row, value) => row.payment.method === value,
  },
  sortValues: {
    placedAt: (row) => row.placedAt,
    total: (row) => row.total,
    number: (row) => row.number,
  },
})

export async function getOrder(id: string): Promise<Order | null> {
  await delay()
  return orders.find((candidate) => candidate.id === id) ?? null
}

function find(id: string): Order {
  const order = orders.find((candidate) => candidate.id === id)
  if (!order) throw new ApiError("Order not found.", 404)
  return order
}

function audit(
  actor: ActorRef,
  order: Order,
  entity: "order" | "payment",
  summary: string,
  field: string,
  before: string,
  after: string,
) {
  recordAuditEntry(actor, {
    action: entity === "order" ? "status_change" : "update",
    entity,
    entityId: order.id,
    entityLabel: order.number,
    summary,
    changes: [{ field, before, after }],
  })
}

/** Moves the order one step along the flow. Shipping needs the courier and tracking number the customer will see. */
export async function advanceOrder(
  actor: ActorRef,
  id: string,
  next: OrderStatus,
  shipment: Omit<Shipment, "shippedAt"> | null,
) {
  await delay()
  const order = find(id)
  if (next !== nextOrderStatus(order.status)) {
    throw new ApiError(
      `The order is ${humanize(order.status).toLowerCase()}; it can't move to ${humanize(next).toLowerCase()}.`,
      409,
    )
  }
  if (next === "shipped" && !shipment)
    throw new ApiError("Enter the courier and tracking number.", 422)
  const now = new Date().toISOString()
  if (next === "shipped" && shipment) order.shipment = { ...shipment, shippedAt: now }
  if (next === "confirmed" && !order.invoiceNumber) {
    order.invoiceNumber = `KG/26-27/${String(orders.filter((item) => item.invoiceNumber).length + 1).padStart(4, "0")}`
  }
  const before = order.status
  order.status = next
  order.timeline.push({
    status: next,
    at: now,
    by: actor,
    note: shipment ? `${shipment.courier} · ${shipment.trackingNumber}` : undefined,
  })
  audit(
    actor,
    order,
    "order",
    next === "shipped" && shipment
      ? `Marked shipped with ${shipment.courier}`
      : `Changed status to ${humanize(next).toLowerCase()}`,
    "Status",
    humanize(before),
    humanize(next),
  )
}

/** Records an offline payment (bank transfer, cash, COD) with its reference. Razorpay marks itself paid. */
export async function markOrderPaid(actor: ActorRef, id: string, reference: string, date: IsoDate) {
  await delay()
  const order = find(id)
  if (!needsConfirmation(order)) throw new ApiError("This payment doesn't need confirming.", 409)
  order.payment = {
    ...order.payment,
    status: "paid",
    reference,
    paidAt: new Date(`${date}T12:00:00+05:30`).toISOString(),
  }
  audit(
    actor,
    order,
    "payment",
    `Marked paid by ${humanize(order.payment.method).toLowerCase()}`,
    "Payment",
    "Pending",
    `Paid (${reference})`,
  )
}

/** Cancels before shipping. Prepaid orders are refunded; an invoiced credit order is reversed on the credit ledger. */
export async function cancelOrder(actor: ActorRef, id: string, reason: string) {
  await delay()
  const order = find(id)
  if (!isCancellable(order.status)) {
    throw new ApiError("Orders can only be cancelled before they are shipped.", 409)
  }
  const before = order.status
  order.status = "cancelled"
  order.cancellationReason = reason
  order.timeline.push({
    status: "cancelled",
    at: new Date().toISOString(),
    by: actor,
    note: reason,
  })
  if (order.payment.status === "paid" && order.payment.gateway === "razorpay") {
    order.payment = { ...order.payment, status: "refunded", refundedAmount: order.total }
  }
  const account = creditAccounts.find((candidate) => candidate.businessId === order.customer.id)
  if (order.payment.method === "credit" && order.invoiceNumber && account) {
    account.ledger.push({
      id: newId("led"),
      type: "credit_note",
      at: new Date().toISOString(),
      reference: `Cancelled ${order.number}`,
      orderId: order.id,
      amount: -order.total,
      dueOn: null,
      note: reason,
      by: actor,
    })
    refreshTotals(account)
  }
  audit(
    actor,
    order,
    "order",
    `Cancelled order: ${reason}${order.payment.status === "refunded" ? `. ${RAZORPAY_REFUND_NOTE} (${formatPrice(order.total)})` : ""}`,
    "Status",
    humanize(before),
    "Cancelled",
  )
}

// Payments and refunds (A37)

function paymentRow(order: Order): PaymentRow {
  return {
    orderId: order.id,
    orderNumber: order.number,
    orderStatus: order.status,
    channel: order.channel,
    customer: order.customer,
    method: order.payment.method,
    gateway: order.payment.gateway,
    status: order.payment.status,
    amount: order.total,
    refundedAmount: order.payment.refundedAmount,
    reference: order.payment.reference,
    paidAt: order.payment.paidAt,
    placedAt: order.placedAt,
    needsConfirmation: needsConfirmation(order),
  }
}

export const paymentEndpoint = listEndpoint<PaymentRow>(() => orders.map(paymentRow), {
  searchText: (row) => `${row.orderNumber} ${row.customer.name} ${row.reference ?? ""}`,
  date: (row) => row.placedAt,
  filters: {
    // "to_confirm" is the dashboard's "Payments to confirm".
    status: (row, value) => (value === "to_confirm" ? row.needsConfirmation : row.status === value),
    method: (row, value) => row.method === value,
    gateway: (row, value) => row.gateway === value,
    channel: (row, value) => row.channel === value,
  },
  sortValues: {
    placedAt: (row) => row.placedAt,
    amount: (row) => row.amount,
    attention: (row) => (row.needsConfirmation ? 0 : row.status === "failed" ? 1 : 2),
  },
})
