import type { FilterOption } from "@/components/ui/FilterSelect"
import type { PaymentMethod } from "@/features/orders/types"
import type {
  ItemCondition,
  ReturnKind,
  ReturnReason,
  ReturnRequest,
  ReturnResolution,
  ReturnStatus,
} from "@/features/returns/types"
import { humanize } from "@/lib/format"

export const RETURN_FILTERS = ["status", "kind", "channel", "reason"] as const

/** The steps every return or replacement goes through before it is resolved. */
export const RETURN_FLOW: ReturnStatus[] = ["requested", "approved", "pickup_scheduled", "verified"]

export const RESOLVED_STATUS: Record<ReturnResolution["type"], ReturnStatus> = {
  refund: "refunded",
  credit_note: "credit_note_issued",
  replacement: "replacement_sent",
}

export const RESOLUTION_LABELS: Record<ReturnResolution["type"], string> = {
  refund: "Refund",
  credit_note: "Credit note",
  replacement: "Send replacement",
}

const options = <T extends string>(values: T[]): FilterOption[] =>
  values.map((value) => ({ value, label: humanize(value) }))

export const RETURN_STATUS_OPTIONS = options<ReturnStatus>([
  ...RETURN_FLOW,
  "rejected",
  "refunded",
  "credit_note_issued",
  "replacement_sent",
  "closed",
])
export const RETURN_KIND_OPTIONS = options<ReturnKind>(["return", "replacement"])
export const RETURN_REASON_OPTIONS = options<ReturnReason>([
  "damaged",
  "wrong_item",
  "does_not_fit",
  "defective",
  "not_as_described",
])
export const CONDITION_OPTIONS = options<ItemCondition>(["unused", "opened", "used", "damaged"])

export function returnAmount(request: Pick<ReturnRequest, "items">): number {
  return request.items.reduce((sum, item) => sum + item.amount, 0)
}

/**
 * How a verified request is settled: a replacement ships again; a return on a B2B credit order becomes a credit
 * note on the credit ledger; every other return is refunded (documented by a credit note too).
 */
export function resolutionFor(
  kind: ReturnKind,
  paymentMethod: PaymentMethod,
): ReturnResolution["type"] {
  if (kind === "replacement") return "replacement"
  return paymentMethod === "credit" ? "credit_note" : "refund"
}

/** The status a request reaches once it is resolved and can be closed. */
export function isResolved(status: ReturnStatus): boolean {
  return Object.values(RESOLVED_STATUS).includes(status)
}
