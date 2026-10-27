import type { FilterOption } from "@/components/ui/FilterSelect"
import type { QuotationStatus } from "@/features/quotations/types"
import { humanize } from "@/lib/format"

export const QUOTATION_FILTERS = ["status", "business"] as const

const STATUSES: QuotationStatus[] = [
  "requested",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "converted",
]

export const QUOTATION_STATUS_OPTIONS: FilterOption[] = STATUSES.map((value) => ({
  value,
  label: humanize(value),
}))

/** Requested, sent and expired quotations can be edited and (re)sent; the rest are settled. */
export function isEditable(status: QuotationStatus): boolean {
  return status === "requested" || status === "sent" || status === "expired"
}
