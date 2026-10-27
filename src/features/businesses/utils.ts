import type { FilterOption } from "@/components/ui/FilterSelect"
import type { BusinessStatus, BusinessType } from "@/features/businesses/types"

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  garage_workshop: "Garage / workshop",
  fleet_operator: "Fleet operator",
  dealer: "Dealer",
  parts_retailer: "Spare-parts retailer",
  reseller: "Reseller",
  corporate: "Corporate",
}

export const BUSINESS_TYPE_OPTIONS: FilterOption[] = Object.entries(BUSINESS_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
)

export const BUSINESS_STATUS_OPTIONS: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
] satisfies { value: BusinessStatus; label: string }[]

export const APPLICATION_FILTERS = ["status", "type"] as const
export const BUSINESS_FILTERS = ["type", "status", "credit"] as const

export const APPLICATION_STATUS_OPTIONS: FilterOption[] = [
  { value: "waiting", label: "Waiting (submitted or under review)" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "sent_back", label: "Sent back" },
  { value: "rejected", label: "Rejected" },
  { value: "approved", label: "Approved" },
]

export const CREDIT_ON_OPTIONS: FilterOption[] = [
  { value: "on", label: "Credit on" },
  { value: "off", label: "Credit off" },
]

/** What an applicant can be asked to correct when an application is sent back. */
export const CORRECTABLE_FIELDS: FilterOption[] = [
  { value: "business_name", label: "Business name" },
  { value: "gstin", label: "GSTIN" },
  { value: "pan", label: "PAN" },
  { value: "address", label: "Address or location" },
  { value: "gst_certificate", label: "GST certificate" },
  { value: "pan_card", label: "PAN card" },
  { value: "trade_licence", label: "Trade licence" },
  { value: "photos", label: "Shop photos" },
]
