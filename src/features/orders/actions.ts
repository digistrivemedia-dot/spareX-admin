"use server"

import { z } from "zod"

import * as api from "@/features/orders/api"
import type { OrderStatus } from "@/features/orders/types"
import {
  markPaidSchema,
  shipSchema,
  type MarkPaidValues,
  type ShipValues,
} from "@/features/orders/schemas"
import {
  CHANNEL_LABELS,
  ORDER_FILTERS,
  PAYMENT_FILTERS,
  PAYMENT_METHOD_LABELS,
} from "@/features/orders/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

const statusSchema = z.enum(["confirmed", "processing", "packed", "out_for_delivery", "delivered"])
const rupees = (paise: number) => (paise / 100).toFixed(2)

/** Every step except shipping, which needs the courier details. */
export async function advanceOrderAction(id: string, next: OrderStatus) {
  return runValidatedMutation("orders.manage", statusSchema, next, (context, data) =>
    api.advanceOrder(context, id, data, null),
  )
}

export async function shipOrderAction(id: string, values: ShipValues) {
  return runValidatedMutation("orders.manage", shipSchema, values, (context, data) =>
    api.advanceOrder(context, id, "shipped", data),
  )
}

export async function markOrderPaidAction(id: string, values: MarkPaidValues) {
  return runValidatedMutation("payments.manage", markPaidSchema, values, (context, data) =>
    api.markOrderPaid(context, id, data.reference, data.date),
  )
}

export async function cancelOrderAction(id: string, reason: string) {
  return runValidatedMutation("orders.manage", reasonSchema, reason, (context, data) =>
    api.cancelOrder(context, id, data),
  )
}

export async function exportOrdersAction(query: string) {
  const params = listParamsFromQuery(query, ORDER_FILTERS)
  return exportCsv({
    entity: "order",
    label: "Orders",
    load: (token) => api.ordersApi.all(token, params),
    columns: [
      { header: "Order", value: (row) => row.number },
      { header: "Placed", value: (row) => formatDateTime(row.placedAt) },
      { header: "Channel", value: (row) => CHANNEL_LABELS[row.channel] },
      { header: "Customer", value: (row) => row.customer.name },
      { header: "Items", value: (row) => row.items.reduce((sum, item) => sum + item.quantity, 0) },
      { header: "Total (₹, incl. GST)", value: (row) => rupees(row.total) },
      { header: "GST (₹)", value: (row) => rupees(row.gstAmount) },
      {
        header: "Payment",
        value: (row) =>
          `${PAYMENT_METHOD_LABELS[row.payment.method]} · ${humanize(row.payment.status)}`,
      },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Invoice", value: (row) => row.invoiceNumber ?? "" },
      {
        header: "Courier",
        value: (row) =>
          row.shipment ? `${row.shipment.courier} ${row.shipment.trackingNumber}` : "",
      },
    ],
  })
}

export async function exportPaymentsAction(query: string) {
  const params = listParamsFromQuery(query, PAYMENT_FILTERS)
  return exportCsv({
    entity: "payment",
    label: "Payments",
    load: (token) => api.paymentsApi.all(token, params),
    columns: [
      { header: "Order", value: (row) => row.orderNumber },
      { header: "Customer", value: (row) => row.customer.name },
      { header: "Channel", value: (row) => CHANNEL_LABELS[row.channel] },
      { header: "Method", value: (row) => PAYMENT_METHOD_LABELS[row.method] },
      { header: "Amount (₹)", value: (row) => rupees(row.amount) },
      { header: "Refunded (₹)", value: (row) => rupees(row.refundedAmount) },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Reference", value: (row) => row.reference ?? "" },
      { header: "Paid at", value: (row) => (row.paidAt ? formatDateTime(row.paidAt) : "") },
    ],
  })
}
