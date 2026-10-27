import type { VehicleType } from "@/features/masters/types"
import type { Booking } from "@/features/bookings/types"
import type { JobCard } from "@/features/job-cards/types"
import type { GarageReview } from "@/features/reviews/types"
import type { Address, GeoPoint, IsoDateTime, Paise } from "@/lib/types"

/** Kannali-owned and partner garages are both garages; this flag says which is which. */
export type GarageOwnership = "kannali" | "partner"

/** An approved garage is not visible to customers until admin switches it live. */
export type GarageStatus = "live" | "not_live"

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export type OpeningHours = {
  day: Weekday
  closed: boolean
  /** 24-hour "HH:mm". */
  opensAt: string
  closesAt: string
}

/** A service from the admin service master, with the garage's own price. */
export type GarageService = {
  serviceId: string
  name: string
  vehicleTypes: VehicleType[]
  price: Paise
  durationMinutes: number
}

export type GarageStaffRole = "owner" | "manager" | "service_advisor" | "technician" | "accountant"

export type GarageStaff = {
  id: string
  name: string
  phone: string
  role: GarageStaffRole
  active: boolean
}

export type GarageBranch = {
  id: string
  name: string
  address: Address
}

export type Garage = {
  id: string
  name: string
  ownership: GarageOwnership
  status: GarageStatus
  ownerName: string
  phone: string
  email: string
  gstin: string
  address: Address
  location: GeoPoint
  description: string
  photos: string[]
  vehicleTypes: VehicleType[]
  openingHours: OpeningHours[]
  services: GarageService[]
  branches: GarageBranch[]
  staff: GarageStaff[]
  pickAndDrop: boolean
  rating: number
  ratingCount: number
  /** The B2B business account the garage runs its workshop from. */
  businessId: string | null
  approvedAt: IsoDateTime
  liveSince: IsoDateTime | null
}

export type GarageListItem = Garage & { city: string; serviceCount: number }

/** What must be complete before a garage can go live on B2C. */
export type GarageReadiness = {
  profile: boolean
  services: boolean
  prices: boolean
  hours: boolean
}

export type GarageDetail = GarageListItem & {
  readiness: GarageReadiness
  bookings: Pick<Booking, "id" | "number" | "date" | "status" | "customer" | "vehicleLabel">[]
  jobCards: Pick<JobCard, "id" | "number" | "status" | "createdAt" | "vehicleLabel">[]
  reviews: GarageReview[]
}

/** Online service payments Kannali collected for a partner garage and owes it (default for Q-09). */
export type GaragePayout = {
  garageId: string
  garageName: string
  unsettledCount: number
  unsettledAmount: Paise
  settledAmount: Paise
  lastSettledAt: IsoDateTime | null
  lastReference: string | null
}
