import type { FilterOption } from "@/components/ui/FilterSelect"
import type { CreditLedgerEntryType, CreditStatus } from "@/features/businesses/types"

export const CREDIT_FILTERS = ["status"] as const

export const CREDIT_STATUS_OPTIONS: FilterOption[] = [
  { value: "overdue", label: "Overdue" },
  { value: "on_hold", label: "On hold" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
] satisfies { value: CreditStatus; label: string }[]

export const LEDGER_TYPE_LABELS: Record<CreditLedgerEntryType, string> = {
  invoice: "Invoice",
  payment: "Payment",
  credit_note: "Credit note",
}
