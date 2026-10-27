import type { InspectionSection } from "@/features/masters/types"
import type { ActorRef, IsoDateTime, Paise, PartyRef } from "@/lib/types"

/** Run by garages in B2B; admin views them read only. */
export type JobCardStatus =
  | "checked_in"
  | "inspection"
  | "awaiting_approval"
  | "in_progress"
  | "quality_check"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled"

export type InspectionResult = "ok" | "attention" | "replace"

export type InspectionFinding = {
  section: InspectionSection
  item: string
  result: InspectionResult
  note: string
}

/** The customer approves or rejects each estimate item separately. */
export type ApprovalStatus = "pending" | "approved" | "rejected"

export type EstimateItem = {
  id: string
  kind: "part" | "labour"
  description: string
  productId: string | null
  quantity: number
  unitPrice: Paise
  total: Paise
  approval: ApprovalStatus
  decidedAt: IsoDateTime | null
}

export type JobCardPaymentStatus = "unpaid" | "paid"

/** Service invoices are in the garage's name and GST. */
export type ServiceInvoice = {
  number: string
  issuedAt: IsoDateTime
  taxableAmount: Paise
  gstAmount: Paise
  total: Paise
}

export type JobCard = {
  id: string
  number: string
  garageId: string
  garageName: string
  bookingId: string | null
  vehicleId: string
  vehicleLabel: string
  registrationNumber: string
  /** null for a walk-in vehicle not linked to a customer. */
  customer: PartyRef | null
  status: JobCardStatus
  checkIn: {
    at: IsoDateTime
    by: ActorRef
    odometerKm: number
    fuelLevel: "empty" | "quarter" | "half" | "three_quarters" | "full"
    complaints: string[]
  }
  inspection: InspectionFinding[]
  estimate: EstimateItem[]
  qualityCheck: { passed: boolean; by: ActorRef; at: IsoDateTime; notes: string } | null
  invoice: ServiceInvoice | null
  payment: {
    status: JobCardPaymentStatus
    method: "online" | "at_garage" | null
    paidAt: IsoDateTime | null
  }
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}
