import "server-only"

import type { Booking } from "@/features/bookings/types"
import { CANCELLABLE_BOOKING_STATUSES } from "@/features/bookings/utils"
import type { JobCard } from "@/features/job-cards/types"
import { jobCardValue } from "@/features/job-cards/utils"
import { ApiError } from "@/lib/api-client"
import { humanize } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { bookings } from "@/mocks/bookings"
import { jobCards } from "@/mocks/job-cards"
import { delay, listEndpoint } from "@/mocks/utils"

// Bookings (A40, A41)

export const bookingEndpoint = listEndpoint<Booking>(() => bookings, {
  searchText: (row) =>
    `${row.number} ${row.customer.name} ${row.customer.phone} ${row.registrationNumber} ${row.garageName}`,
  date: (row) => row.date,
  filters: {
    status: (row, value) => row.status === value,
    garage: (row, value) => row.garageId === value,
    pickAndDrop: (row, value) =>
      value === "yes" ? row.pickAndDrop !== null : row.pickAndDrop === null,
  },
  sortValues: {
    date: (row) => row.date,
    createdAt: (row) => row.createdAt,
    garageName: (row) => row.garageName,
  },
})

export async function getBooking(id: string): Promise<Booking | null> {
  await delay()
  return bookings.find((candidate) => candidate.id === id) ?? null
}

export async function cancelBooking(actor: ActorRef, id: string, reason: string) {
  await delay()
  const booking = bookings.find((candidate) => candidate.id === id)
  if (!booking) throw new ApiError("Booking not found.", 404)
  // Once the vehicle is in the workshop, the garage closes the job card instead.
  if (!CANCELLABLE_BOOKING_STATUSES.includes(booking.status)) {
    throw new ApiError(
      `A booking that is ${humanize(booking.status).toLowerCase()} can't be cancelled.`,
      409,
    )
  }
  const before = booking.status
  booking.status = "cancelled"
  booking.cancellationReason = reason
  booking.timeline.push({
    status: "cancelled",
    at: new Date().toISOString(),
    by: actor,
    note: reason,
  })
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "booking",
    entityId: booking.id,
    entityLabel: booking.number,
    summary: `Cancelled booking: ${reason}`,
    changes: [{ field: "Status", before: humanize(before), after: "Cancelled" }],
  })
}

// Job cards (A42, A43) — run by garages on B2B; read only here.

export const jobCardEndpoint = listEndpoint<JobCard>(() => jobCards, {
  searchText: (row) =>
    `${row.number} ${row.registrationNumber} ${row.vehicleLabel} ${row.customer?.name ?? ""} ${row.garageName}`,
  date: (row) => row.createdAt,
  filters: {
    status: (row, value) => row.status === value,
    garage: (row, value) => row.garageId === value,
    payment: (row, value) => row.payment.status === value,
  },
  sortValues: {
    createdAt: (row) => row.createdAt,
    value: jobCardValue,
    garageName: (row) => row.garageName,
  },
})

export async function getJobCard(id: string): Promise<JobCard | null> {
  await delay()
  return jobCards.find((candidate) => candidate.id === id) ?? null
}
