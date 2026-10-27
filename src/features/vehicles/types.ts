import type { FuelType, VehicleType } from "@/features/masters/types"
import type { JobCardStatus } from "@/features/job-cards/types"
import type { IsoDate, IsoDateTime, Paise } from "@/lib/types"

export type VehicleDocumentType = "rc" | "insurance" | "puc"

export type VehicleDocument = {
  id: string
  type: VehicleDocumentType
  number: string
  expiresOn: IsoDate | null
  fileUrl: string
}

/** One owner in the vehicle's history. `to` is null for the current owner. */
export type VehicleOwnership = {
  customerId: string
  customerName: string
  from: IsoDate
  to: IsoDate | null
}

export type Vehicle = {
  id: string
  registrationNumber: string
  vehicleType: VehicleType
  brandId: string
  modelId: string
  variantId: string
  year: number
  fuel: FuelType
  colour: string
  chassisNumber: string
  odometerKm: number
  /** null for a walk-in vehicle a garage added that is not yet linked to a customer. */
  ownerId: string | null
  owners: VehicleOwnership[]
  documents: VehicleDocument[]
  addedBy: "customer" | "garage"
  createdAt: IsoDateTime
}

export type VehicleListItem = Vehicle & {
  brandName: string
  modelName: string
  variantName: string
  /** null for a walk-in vehicle not linked to a customer. */
  ownerName: string | null
}

/** One visit to any garage, from its job card. Other garages see this history without prices. */
export type ServiceRecord = {
  jobCardId: string
  jobCardNumber: string
  garageName: string
  date: IsoDateTime
  odometerKm: number
  status: JobCardStatus
  work: string[]
  total: Paise | null
}

export type InstalledPart = {
  jobCardId: string
  jobCardNumber: string
  date: IsoDateTime
  garageName: string
  description: string
  productId: string | null
  quantity: number
}

export type ServiceInvoiceSummary = {
  jobCardId: string
  number: string
  issuedAt: IsoDateTime
  garageName: string
  total: Paise
}

export type VehicleDetail = VehicleListItem & {
  serviceHistory: ServiceRecord[]
  partsInstalled: InstalledPart[]
  invoices: ServiceInvoiceSummary[]
}
