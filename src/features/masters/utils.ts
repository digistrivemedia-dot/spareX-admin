import type { FilterOption } from "@/components/ui/FilterSelect"
import type { FuelType, InspectionSection, VehicleType } from "@/features/masters/types"

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  bike: "Bike",
  scooter: "Scooter",
  car: "Car",
  commercial: "Commercial",
}

export const FUEL_LABELS: Record<FuelType, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  cng: "CNG",
  electric: "Electric",
  hybrid: "Hybrid",
}

export const INSPECTION_SECTION_LABELS: Record<InspectionSection, string> = {
  engine: "Engine",
  brakes: "Brakes",
  tyres: "Tyres",
  battery: "Battery",
  suspension: "Suspension",
  lights: "Lights",
  ac: "AC",
  electricals: "Electricals",
  fluids: "Fluids",
  body: "Body",
}

function toOptions<T extends string>(labels: Record<T, string>): FilterOption[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }))
}

export const VEHICLE_TYPE_OPTIONS = toOptions(VEHICLE_TYPE_LABELS)
export const FUEL_OPTIONS = toOptions(FUEL_LABELS)
export const ACTIVE_OPTIONS: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

/** The category "parent" choice for a top-level category (selects can't hold an empty value). */
export const TOP_LEVEL = "top"

/** URL filters each masters list accepts; shared by the page and its CSV export. */
export const MASTER_FILTERS = {
  vehicleTypes: ["active"],
  vehicleBrands: ["type", "active"],
  vehicleModels: ["brand", "type", "fuel", "active"],
  productCategories: ["level", "parent", "active"],
  partBrands: ["oem", "active"],
  serviceCategories: ["active"],
  serviceItems: ["category", "type", "active"],
} as const

/** "2021–2025", or one year. */
export function formatYearRange(range: { from: number; to: number } | null): string {
  if (!range) return "–"
  return range.from === range.to ? String(range.from) : `${range.from}–${range.to}`
}
