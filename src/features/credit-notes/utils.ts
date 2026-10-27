import type { FilterOption } from "@/components/ui/FilterSelect"
import type { CreditNoteAppliedTo } from "@/features/credit-notes/types"

export const CREDIT_NOTE_FILTERS = ["channel", "appliedTo"] as const

export const APPLIED_TO_LABELS: Record<CreditNoteAppliedTo, string> = {
  refund: "Refund",
  credit_ledger: "Credit ledger",
}

export const APPLIED_TO_OPTIONS: FilterOption[] = Object.entries(APPLIED_TO_LABELS).map(
  ([value, label]) => ({ value, label }),
)
