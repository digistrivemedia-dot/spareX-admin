import type { Address, IsoDate, IsoDateTime, Paise, PartyRef, TimelineEvent } from "@/lib/types"

/** Garages accept or decline (no reschedule); customers can cancel anytime; admin can cancel with a reason. */
export type BookingStatus =
  "pending" | "accepted" | "declined" | "in_progress" | "completed" | "cancelled"

export type BookedService = {
  serviceId: string
  name: string
  price: Paise
}

/** Free pick and drop: the customer picks a pickup window; garage staff do the pickup. */
export type PickAndDrop = {
  pickupWindow: string
  pickupAddress: Address
  dropAddress: Address
}

export type Booking = {
  id: string
  number: string
  customer: PartyRef
  vehicleId: string
  vehicleLabel: string
  registrationNumber: string
  garageId: string
  garageName: string
  services: BookedService[]
  estimatedTotal: Paise
  /** Bookings are date only at launch. */
  date: IsoDate
  /** Behind the `bookingTimeSlots` switch. */
  timeSlot: string | null
  pickAndDrop: PickAndDrop | null
  customerNote: string
  status: BookingStatus
  cancellationReason: string | null
  jobCardId: string | null
  timeline: TimelineEvent<BookingStatus>[]
  createdAt: IsoDateTime
}
