"use server"

import * as api from "@/features/bookings/api"
import { BOOKING_FILTERS } from "@/features/bookings/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDate, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

export async function cancelBookingAction(id: string, reason: string) {
  return runValidatedMutation("bookings.manage", reasonSchema, reason, (context, data) =>
    api.cancelBooking(context, id, data),
  )
}

export async function exportBookingsAction(query: string) {
  const params = listParamsFromQuery(query, BOOKING_FILTERS)
  return exportCsv({
    entity: "booking",
    label: "Bookings",
    load: (token) => api.bookingsApi.all(token, params),
    columns: [
      { header: "Booking", value: (row) => row.number },
      { header: "Service date", value: (row) => formatDate(row.date) },
      { header: "Customer", value: (row) => row.customer.name },
      { header: "Vehicle", value: (row) => `${row.registrationNumber} ${row.vehicleLabel}` },
      { header: "Garage", value: (row) => row.garageName },
      {
        header: "Services",
        value: (row) => row.services.map((service) => service.name).join("; "),
      },
      { header: "Pick and drop", value: (row) => (row.pickAndDrop ? "Yes" : "No") },
      { header: "Pickup window", value: (row) => row.pickAndDrop?.pickupWindow ?? "" },
      { header: "Status", value: (row) => humanize(row.status) },
    ],
  })
}
