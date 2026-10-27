import "server-only"

import type { Booking } from "@/features/bookings/types"
import type { Report, ReportColumn, ReportQuery } from "@/features/reports/types"
import { humanize } from "@/lib/format"
import { bookings } from "@/mocks/bookings"
import { jobCards } from "@/mocks/job-cards"
import { breakdown, buildSeries, inRange, sum } from "@/mocks/reports/shared"
import { vehicles } from "@/mocks/vehicles"

const COLUMNS: ReportColumn[] = [
  { key: "bookings", label: "Bookings", format: "count" },
  { key: "completed", label: "Completed", format: "count" },
  { key: "cancelled", label: "Cancelled", format: "count" },
  { key: "value", label: "Job value (incl. GST)", format: "money" },
]

const TITLES: Record<string, string> = {
  garage: "By garage",
  service: "By service",
  vehicleType: "By vehicle type",
}

/** What a booking's work came to: its job card invoice; nothing until the garage invoices it. */
function jobValue(booking: Booking): number {
  if (booking.status === "cancelled") return 0
  return jobCards.find((card) => card.id === booking.jobCardId)?.invoice?.total ?? 0
}

const counts = (booking: Booking) => ({
  bookings: 1,
  completed: booking.status === "completed" ? 1 : 0,
  cancelled: booking.status === "cancelled" ? 1 : 0,
})

/** A52: garages, vehicles and service types; bookings, completed and cancelled work, and job value. */
export function serviceReport(query: ReportQuery): Report {
  const inPeriod = bookings.filter((booking) => inRange(`${booking.date}T12:00:00Z`, query))
  const completed = inPeriod.filter((booking) => booking.status === "completed")
  const cancelled = inPeriod.filter((booking) => booking.status === "cancelled")
  const vehicleType = (booking: Booking) =>
    vehicles.find((vehicle) => vehicle.id === booking.vehicleId)?.vehicleType

  const rows =
    query.dimension === "service"
      ? breakdown(
          inPeriod.flatMap((booking) => booking.services.map((service) => ({ booking, service }))),
          ({ service }) => ({ id: service.serviceId, name: service.name }),
          COLUMNS,
          ({ booking, service }) => ({
            ...counts(booking),
            value: booking.status === "completed" ? service.price : 0,
          }),
          query,
        )
      : breakdown(
          inPeriod,
          (booking) => {
            if (query.dimension === "vehicleType") {
              const type = vehicleType(booking)
              return type ? { id: type, name: humanize(type) } : null
            }
            return { id: booking.garageId, name: booking.garageName }
          },
          COLUMNS,
          (booking) => ({ ...counts(booking), value: jobValue(booking) }),
          query,
        )

  return {
    stats: [
      { label: "Bookings", value: inPeriod.length, format: "count" },
      { label: "Completed", value: completed.length, format: "count" },
      {
        label: "Cancelled",
        value: cancelled.length,
        format: "count",
        hint: inPeriod.length
          ? `${Math.round((cancelled.length / inPeriod.length) * 100)}% of bookings`
          : undefined,
      },
      {
        label: "Job value",
        value: sum(inPeriod, jobValue),
        format: "money",
        hint: "Invoiced, incl. GST",
      },
    ],
    chartTitle: "Bookings by period",
    series: buildSeries(
      inPeriod,
      query,
      (booking) => `${booking.date}T12:00:00Z`,
      [
        { key: "completed", label: "Completed" },
        { key: "open", label: "Open" },
        { key: "cancelled", label: "Cancelled" },
      ],
      "count",
      (booking) => ({
        key: ["completed", "cancelled"].includes(booking.status) ? booking.status : "open",
        amount: 1,
      }),
    ),
    table: {
      title: TITLES[query.dimension] ?? "Service",
      description:
        query.dimension === "service"
          ? "Job value here is the garage's price for that service on completed bookings."
          : undefined,
      columns: COLUMNS,
      rows,
    },
  }
}
