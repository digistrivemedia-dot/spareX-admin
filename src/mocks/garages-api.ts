import "server-only"

import type {
  Garage,
  GarageDetail,
  GarageListItem,
  GaragePayout,
  GarageReadiness,
} from "@/features/garages/types"
import { ApiError } from "@/lib/api-client"
import { formatPrice } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { bookings } from "@/mocks/bookings"
import { garages } from "@/mocks/garages"
import { jobCards } from "@/mocks/job-cards"
import { garageReviews } from "@/mocks/reviews"
import { delay, listEndpoint, persistent } from "@/mocks/utils"

function garageRow(garage: Garage): GarageListItem {
  return { ...garage, city: garage.address.city, serviceCount: garage.services.length }
}

function readinessOf(garage: Garage): GarageReadiness {
  return {
    profile: Boolean(garage.description && garage.phone && garage.gstin && garage.address.line1),
    services: garage.services.length > 0,
    prices: garage.services.length > 0 && garage.services.every((service) => service.price > 0),
    hours: garage.openingHours.some((day) => !day.closed),
  }
}

export const garageEndpoint = listEndpoint<GarageListItem>(() => garages.map(garageRow), {
  searchText: (row) => `${row.name} ${row.ownerName} ${row.city} ${row.address.line2 ?? ""}`,
  filters: {
    ownership: (row, value) => row.ownership === value,
    status: (row, value) => row.status === value,
    city: (row, value) => row.city === value,
  },
  sortValues: {
    name: (row) => row.name,
    rating: (row) => row.rating,
    approvedAt: (row) => row.approvedAt,
  },
})

export async function garageCities(): Promise<string[]> {
  return [...new Set(garages.map((garage) => garage.address.city))].sort()
}

export async function garageOptions(): Promise<{ id: string; name: string }[]> {
  return garages.map(({ id, name }) => ({ id, name }))
}

export async function getGarage(id: string): Promise<GarageDetail | null> {
  await delay()
  const garage = garages.find((candidate) => candidate.id === id)
  if (!garage) return null
  return {
    ...garageRow(garage),
    readiness: readinessOf(garage),
    bookings: bookings
      .filter((booking) => booking.garageId === id)
      .map(({ id, number, date, status, customer, vehicleLabel }) => ({
        id,
        number,
        date,
        status,
        customer,
        vehicleLabel,
      })),
    jobCards: jobCards
      .filter((card) => card.garageId === id)
      .map(({ id, number, status, createdAt, vehicleLabel }) => ({
        id,
        number,
        status,
        createdAt,
        vehicleLabel,
      })),
    reviews: garageReviews.filter((review) => review.garageId === id),
  }
}

/** Live garages are bookable on B2C. Going live needs a complete profile, services, prices and hours. */
export async function setGarageLive(
  actor: ActorRef,
  id: string,
  live: boolean,
  reason: string | null,
) {
  await delay()
  const garage = garages.find((candidate) => candidate.id === id)
  if (!garage) throw new ApiError("Garage not found.", 404)
  if (live && Object.values(readinessOf(garage)).includes(false)) {
    throw new ApiError("Complete the checklist before going live.", 409)
  }
  garage.status = live ? "live" : "not_live"
  garage.liveSince = live ? new Date().toISOString() : null
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "garage",
    entityId: garage.id,
    entityLabel: garage.name,
    summary: live ? "Switched garage live" : `Took garage offline: ${reason}`,
    changes: [
      { field: "Status", before: live ? "Not live" : "Live", after: live ? "Live" : "Not live" },
    ],
  })
}

// Garage payouts (A59): built for Q-09's default — online payments reach Kannali and are settled to partners.

const settlements = persistent("garage-settlements", () => ({
  settledJobCards: new Set<string>(),
  history: new Map<string, { amount: number; at: string; reference: string }[]>(),
}))

function onlinePayments(garageId: string) {
  return jobCards.filter(
    (card) =>
      card.garageId === garageId &&
      card.payment.status === "paid" &&
      card.payment.method === "online" &&
      card.invoice,
  )
}

function payoutRow(garage: Garage): GaragePayout {
  const paid = onlinePayments(garage.id)
  const unsettled = paid.filter((card) => !settlements.settledJobCards.has(card.id))
  const history = settlements.history.get(garage.id) ?? []
  const last = history.at(-1)
  return {
    garageId: garage.id,
    garageName: garage.name,
    unsettledCount: unsettled.length,
    unsettledAmount: unsettled.reduce((sum, card) => sum + (card.invoice?.total ?? 0), 0),
    settledAmount: history.reduce((sum, entry) => sum + entry.amount, 0),
    lastSettledAt: last?.at ?? null,
    lastReference: last?.reference ?? null,
  }
}

export const payoutEndpoint = listEndpoint<GaragePayout>(
  () => garages.filter((garage) => garage.ownership === "partner").map(payoutRow),
  {
    searchText: (row) => row.garageName,
    filters: {
      due: (row, value) => (value === "yes" ? row.unsettledAmount > 0 : row.unsettledAmount === 0),
    },
    sortValues: {
      garageName: (row) => row.garageName,
      unsettledAmount: (row) => row.unsettledAmount,
    },
  },
)

export async function settlePayout(actor: ActorRef, garageId: string, reference: string) {
  await delay()
  const garage = garages.find(
    (candidate) => candidate.id === garageId && candidate.ownership === "partner",
  )
  if (!garage) throw new ApiError("Partner garage not found.", 404)
  const due = onlinePayments(garageId).filter((card) => !settlements.settledJobCards.has(card.id))
  const amount = due.reduce((sum, card) => sum + (card.invoice?.total ?? 0), 0)
  if (amount === 0) throw new ApiError("Nothing is due to this garage.", 409)
  due.forEach((card) => settlements.settledJobCards.add(card.id))
  settlements.history.set(garageId, [
    ...(settlements.history.get(garageId) ?? []),
    { amount, at: new Date().toISOString(), reference },
  ])
  recordAuditEntry(actor, {
    action: "update",
    entity: "garage",
    entityId: garage.id,
    entityLabel: `Payout to ${garage.name}`,
    summary: `Settled ${formatPrice(amount)} for ${due.length} online payments (${reference})`,
    changes: [{ field: "Due to garage", before: formatPrice(amount), after: formatPrice(0) }],
  })
}
