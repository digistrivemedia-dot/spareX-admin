import "server-only"

import type { Booking, BookingStatus } from "@/features/bookings/types"
import type { Garage } from "@/features/garages/types"
import type { Vehicle } from "@/features/vehicles/types"
import { PICKUP_WINDOWS } from "@/lib/constants"
import type { ActorRef, PartyRef, TimelineEvent } from "@/lib/types"
import { customers } from "@/mocks/customers"
import { garages } from "@/mocks/garages"
import { vehicleBrands, vehicleModels } from "@/mocks/masters"
import { dateOnly, daysAgo, persistent } from "@/mocks/utils"
import { vehicles } from "@/mocks/vehicles"

export function vehicleLabel(vehicle: Vehicle): string {
  const brand = vehicleBrands.find((candidate) => candidate.id === vehicle.brandId)
  const model = vehicleModels.find((candidate) => candidate.id === vehicle.modelId)
  return `${brand?.name ?? ""} ${model?.name ?? ""} (${vehicle.year})`.trim()
}

/**
 * [service date, in days from today (negative = upcoming), first customer number to try, garage, services, status,
 * pick and drop]. The first customer from that number with a vehicle the garage services is used.
 */
type BookingSeed = [number, number, string, string[], BookingStatus, boolean]

const BOOKINGS: BookingSeed[] = [
  [-3, 1, "gar_001", ["sv_general-service"], "pending", true],
  [-2, 3, "gar_002", ["sv_full-car-service"], "pending", false],
  [-5, 8, "gar_005", ["sv_pre-purchase-inspection"], "pending", false],
  [-1, 5, "gar_004", ["sv_general-service", "sv_foam-wash"], "accepted", true],
  [0, 11, "gar_001", ["sv_engine-oil-change"], "accepted", false],
  [0, 13, "gar_003", ["sv_full-car-service"], "in_progress", false],
  [1, 17, "gar_002", ["sv_brake-pad-replacement"], "in_progress", false],
  [2, 21, "gar_007", ["sv_wheel-alignment", "sv_wheel-balancing"], "in_progress", true],
  [2, 23, "gar_001", ["sv_full-car-service"], "in_progress", true],
  [5, 25, "gar_006", ["sv_general-service"], "completed", true],
  [9, 27, "gar_005", ["sv_full-car-service"], "completed", false],
  [14, 1, "gar_002", ["sv_full-car-service", "sv_foam-wash"], "completed", true],
  [20, 29, "gar_004", ["sv_general-service"], "completed", false],
  [27, 31, "gar_003", ["sv_engine-oil-change"], "completed", false],
  [35, 33, "gar_001", ["sv_battery-check-and-replacement"], "completed", true],
  [42, 35, "gar_007", ["sv_denting-and-painting"], "completed", false],
  [50, 2, "gar_004", ["sv_general-service"], "completed", true],
  [58, 6, "gar_006", ["sv_brake-pad-replacement"], "completed", false],
  [66, 10, "gar_002", ["sv_ac-service-and-gas-top-up"], "completed", false],
  [74, 14, "gar_001", ["sv_general-service"], "completed", true],
  [80, 18, "gar_005", ["sv_engine-oil-change"], "completed", false],
  [-1, 37, "gar_006", ["sv_general-service"], "declined", false],
  [3, 39, "gar_004", ["sv_puncture-repair"], "declined", false],
  [6, 1, "gar_001", ["sv_general-service"], "cancelled", true],
  [-2, 4, "gar_007", ["sv_full-car-service"], "cancelled", false],
]

const ADMIN: ActorRef = { type: "admin", id: "adm_kiran", name: "Kiran Gowda" }

/** The first customer from `startNumber` with a vehicle both the garage and the booked service can take. */
function findCustomerVehicle(startNumber: number, garage: Garage, serviceId: string) {
  const serviceTypes =
    garage.services.find((service) => service.serviceId === serviceId)?.vehicleTypes ?? []
  for (let offset = 0; offset < customers.length; offset++) {
    const customer = customers[(startNumber - 1 + offset) % customers.length]
    const vehicle = vehicles.find(
      (candidate) =>
        candidate.ownerId === customer?.id && serviceTypes.includes(candidate.vehicleType),
    )
    if (customer && vehicle) return { customer, vehicle }
  }
  throw new Error(`No demo vehicle for ${serviceId} at ${garage.name}`)
}

function timelineFor(
  status: BookingStatus,
  createdAt: string,
  serviceDay: number,
  customer: ActorRef,
  garage: ActorRef,
): TimelineEvent<BookingStatus>[] {
  const events: TimelineEvent<BookingStatus>[] = [
    { status: "pending", at: createdAt, by: customer },
  ]
  if (status === "declined")
    return [...events, { status, at: createdAt, by: garage, note: "Fully booked on this date." }]
  if (status === "cancelled") {
    const byAdmin = serviceDay < 0
    return [
      ...events,
      {
        status,
        at: createdAt,
        by: byAdmin ? ADMIN : customer,
        note: byAdmin ? "Garage closed for a local holiday; customer informed." : "Plans changed.",
      },
    ]
  }
  if (status === "pending") return events
  events.push({ status: "accepted", at: createdAt, by: garage })
  if (status === "accepted") return events
  events.push({ status: "in_progress", at: daysAgo(Math.max(serviceDay, 0), 9, 30), by: garage })
  if (status === "completed")
    events.push({ status, at: daysAgo(Math.max(serviceDay, 0), 18), by: garage })
  return events
}

export const bookings = persistent<Booking[]>("bookings", () =>
  BOOKINGS.map(([serviceDay, startNumber, garageId, serviceIds, status, pickAndDrop], index) => {
    const garage = garages.find((candidate) => candidate.id === garageId)
    if (!garage) throw new Error(`Unknown demo garage ${garageId}`)
    const { customer, vehicle } = findCustomerVehicle(startNumber, garage, serviceIds[0] ?? "")
    const services = serviceIds.map((serviceId) => {
      const service = garage.services.find((candidate) => candidate.serviceId === serviceId)
      if (!service) throw new Error(`${garage.name} does not offer ${serviceId}`)
      return { serviceId, name: service.name, price: service.price }
    })
    const address = customer.addresses[0]
    const party: PartyRef = {
      type: "customer",
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    }
    const createdAt = daysAgo(Math.max(serviceDay, 0) + 2, 20)
    return {
      id: `bk_${String(index + 1).padStart(3, "0")}`,
      number: `BK-${2001 + index}`,
      customer: party,
      vehicleId: vehicle.id,
      vehicleLabel: vehicleLabel(vehicle),
      registrationNumber: vehicle.registrationNumber,
      garageId,
      garageName: garage.name,
      services,
      estimatedTotal: services.reduce((sum, service) => sum + service.price, 0),
      date: dateOnly(daysAgo(serviceDay)),
      timeSlot: null,
      pickAndDrop:
        pickAndDrop && garage.pickAndDrop && address
          ? {
              pickupWindow: PICKUP_WINDOWS[index % PICKUP_WINDOWS.length] ?? "",
              pickupAddress: address,
              dropAddress: address,
            }
          : null,
      customerNote: index % 4 === 0 ? "Please check the brake noise as well." : "",
      status,
      cancellationReason:
        status === "cancelled"
          ? serviceDay < 0
            ? "Garage closed for a local holiday; customer informed."
            : "Plans changed."
          : null,
      // The garage opens a job card when work starts; the job-card mock uses this id.
      jobCardId:
        status === "in_progress" || status === "completed"
          ? `jc_${String(index + 1).padStart(3, "0")}`
          : null,
      timeline: timelineFor(
        status,
        createdAt,
        serviceDay,
        { type: "customer", id: customer.id, name: customer.name },
        { type: "garage", id: garage.id, name: garage.name },
      ),
      createdAt,
    }
  }),
)
