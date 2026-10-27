import type { FilterOption } from "@/components/ui/FilterSelect"
import type { VehicleDocumentType } from "@/features/vehicles/types"

export const VEHICLE_FILTERS = ["type", "brand", "model", "fuel", "owner"] as const

export const OWNER_OPTIONS: FilterOption[] = [
  { value: "linked", label: "Linked to a customer" },
  { value: "walk_in", label: "Walk-in, not linked" },
]

export const DOCUMENT_LABELS: Record<VehicleDocumentType, string> = {
  rc: "Registration certificate (RC)",
  insurance: "Insurance",
  puc: "Pollution certificate (PUC)",
}

/** "Honda Activa 6G STD (2024)" */
export function vehicleTitle(vehicle: {
  brandName: string
  modelName: string
  variantName: string
  year: number
}): string {
  return `${vehicle.brandName} ${vehicle.modelName} ${vehicle.variantName} (${vehicle.year})`
}
