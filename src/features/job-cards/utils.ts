import type { FilterOption } from "@/components/ui/FilterSelect"
import type { InspectionResult, JobCard, JobCardStatus } from "@/features/job-cards/types"
import { humanize } from "@/lib/format"
import type { Paise } from "@/lib/types"

export const JOB_CARD_FILTERS = ["status", "garage", "payment"] as const

const STATUSES: JobCardStatus[] = [
  "checked_in",
  "inspection",
  "awaiting_approval",
  "in_progress",
  "quality_check",
  "ready_for_delivery",
  "delivered",
  "cancelled",
]

export const JOB_CARD_STATUS_OPTIONS: FilterOption[] = STATUSES.map((value) => ({
  value,
  label: humanize(value),
}))

export const PAYMENT_OPTIONS: FilterOption[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
]

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  ok: "OK",
  attention: "Needs attention",
  replace: "Replace",
}

/** What the job is worth: the invoice once issued, otherwise the approved estimate. Incl. GST. */
export function jobCardValue(card: JobCard): Paise {
  return (
    card.invoice?.total ??
    card.estimate
      .filter((item) => item.approval === "approved")
      .reduce((sum, item) => sum + item.total, 0)
  )
}
