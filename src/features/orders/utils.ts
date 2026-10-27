import type { FilterOption } from "@/components/ui/FilterSelect"
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/features/orders/types"
import { humanize } from "@/lib/format"
import type { Channel } from "@/lib/types"

export const ORDER_FILTERS = ["status", "channel", "payment", "method"] as const
export const PAYMENT_FILTERS = ["status", "method", "gateway", "channel"] as const

/** The order of statuses admin moves an order through (+ cancelled). */
export const ORDER_FLOW: OrderStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  wallet: "Wallet",
  bank_transfer: "Bank transfer",
  cash: "Cash",
  cod: "Cash on delivery",
  credit: "Credit",
}

export const CHANNEL_LABELS: Record<Channel, string> = { b2c: "B2C", b2b: "B2B" }

const toOptions = <T extends string>(values: T[], label: (value: T) => string): FilterOption[] =>
  values.map((value) => ({ value, label: label(value) }))

export const ORDER_STATUS_OPTIONS = toOptions<OrderStatus>([...ORDER_FLOW, "cancelled"], humanize)
export const CHANNEL_OPTIONS = toOptions<Channel>(["b2c", "b2b"], (value) => CHANNEL_LABELS[value])
export const PAYMENT_METHOD_OPTIONS = toOptions(
  Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[],
  (value) => PAYMENT_METHOD_LABELS[value],
)
export const PAYMENT_STATUS_OPTIONS = toOptions<PaymentStatus>(
  ["pending", "paid", "failed", "refunded", "partially_refunded"],
  humanize,
)
export const GATEWAY_OPTIONS: FilterOption[] = [
  { value: "razorpay", label: "Razorpay (online)" },
  { value: "offline", label: "Offline (marked by admin)" },
]

/** The next step for an order, or null when it is finished or cancelled. */
export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status)
  return index >= 0 && index < ORDER_FLOW.length - 1 ? (ORDER_FLOW[index + 1] ?? null) : null
}

/** Customers and admin can cancel until the order is shipped. */
export function isCancellable(status: OrderStatus): boolean {
  return (
    ORDER_FLOW.indexOf(status) >= 0 && ORDER_FLOW.indexOf(status) < ORDER_FLOW.indexOf("shipped")
  )
}

/** Offline payments admin confirms by hand. COD only once the parcel is delivered. */
export function needsConfirmation(order: Order): boolean {
  const { method, status } = order.payment
  if (order.status === "cancelled" || status !== "pending") return false
  if (method === "bank_transfer" || method === "cash") return true
  return method === "cod" && order.status === "delivered"
}
