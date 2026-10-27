import type { VehicleType } from "@/features/masters/types"
import type { ActorRef, IsoDateTime } from "@/lib/types"

/** Both come from B2C: "my vehicle isn't listed" and "no part fits my vehicle". */
export type EnquiryKind = "vehicle_not_listed" | "no_part_fits"

export type EnquiryStatus = "new" | "in_progress" | "resolved" | "closed"

export type EnquiryNote = {
  id: string
  at: IsoDateTime
  by: ActorRef
  text: string
}

export type Enquiry = {
  id: string
  number: string
  kind: EnquiryKind
  status: EnquiryStatus
  /** null for a guest who was not signed in. */
  customerId: string | null
  name: string
  phone: string
  email: string | null
  vehicle: {
    vehicleType: VehicleType
    brand: string
    model: string
    variant: string | null
    year: number | null
  }
  /** For "no part fits": what the customer was looking for. */
  partQuery: string | null
  message: string
  notes: EnquiryNote[]
  reply: { text: string; at: IsoDateTime; by: ActorRef } | null
  createdAt: IsoDateTime
}
