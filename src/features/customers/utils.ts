import type { FilterOption } from "@/components/ui/FilterSelect"

export const CUSTOMER_FILTERS = ["status", "city"] as const

export const CUSTOMER_STATUS_OPTIONS: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deletion_requested", label: "Deletion requested" },
  { value: "deleted", label: "Deleted" },
]
