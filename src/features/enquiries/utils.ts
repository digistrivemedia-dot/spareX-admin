import type { FilterOption } from "@/components/ui/FilterSelect"
import type { EnquiryKind, EnquiryStatus } from "@/features/enquiries/types"

export const ENQUIRY_FILTERS = ["kind", "status", "vehicleType"] as const

export const ENQUIRY_KIND_LABELS: Record<EnquiryKind, string> = {
  vehicle_not_listed: "Vehicle not listed",
  no_part_fits: "No part fits",
}

export const ENQUIRY_KIND_OPTIONS: FilterOption[] = Object.entries(ENQUIRY_KIND_LABELS).map(
  ([value, label]) => ({ value, label }),
)

export const ENQUIRY_STATUS_OPTIONS: FilterOption[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] satisfies { value: EnquiryStatus; label: string }[]
