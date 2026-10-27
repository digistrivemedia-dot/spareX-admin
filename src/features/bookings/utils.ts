import type { FilterOption } from "@/components/ui/FilterSelect"
import type { BookingStatus } from "@/features/bookings/types"

export const BOOKING_FILTERS = ["status", "garage", "pickAndDrop"] as const

export const BOOKING_STATUS_OPTIONS: FilterOption[] = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
] satisfies { value: BookingStatus; label: string }[]

export const PICK_AND_DROP_OPTIONS: FilterOption[] = [
  { value: "yes", label: "Pick and drop" },
  { value: "no", label: "Customer drops off" },
]

/** Admin can cancel before the garage starts work. */
export const CANCELLABLE_BOOKING_STATUSES: BookingStatus[] = ["pending", "accepted"]
