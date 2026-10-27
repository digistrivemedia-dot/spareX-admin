import type { FilterOption } from "@/components/ui/FilterSelect"
import type { GarageReadiness, GarageStaffRole, Weekday } from "@/features/garages/types"

export const GARAGE_FILTERS = ["ownership", "status", "city"] as const
export const PAYOUT_FILTERS = ["due"] as const

export const OWNERSHIP_OPTIONS: FilterOption[] = [
  { value: "kannali", label: "Kannali-owned" },
  { value: "partner", label: "Partner" },
]

export const GARAGE_STATUS_OPTIONS: FilterOption[] = [
  { value: "live", label: "Live" },
  { value: "not_live", label: "Not live" },
]

export const READINESS_LABELS: Record<keyof GarageReadiness, string> = {
  profile: "Profile complete (description, phone, GSTIN, address)",
  services: "Services chosen from the service master",
  prices: "A price for every service",
  hours: "Opening hours set",
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}

export const STAFF_ROLE_LABELS: Record<GarageStaffRole, string> = {
  owner: "Owner",
  manager: "Manager",
  service_advisor: "Service advisor",
  technician: "Technician",
  accountant: "Accountant",
}
