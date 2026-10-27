import "server-only"

import type {
  EstimateItem,
  InspectionFinding,
  JobCard,
  JobCardStatus,
} from "@/features/job-cards/types"
import type { Garage } from "@/features/garages/types"
import type { Vehicle } from "@/features/vehicles/types"
import { splitInclusiveGst } from "@/lib/gst"
import type { ActorRef, PartyRef } from "@/lib/types"
import { bookings, vehicleLabel } from "@/mocks/bookings"
import { products } from "@/mocks/catalog"
import { garages } from "@/mocks/garages"
import { inspectionTemplates } from "@/mocks/masters"
import { daysAgo, persistent, seededRandom } from "@/mocks/utils"
import { vehicles } from "@/mocks/vehicles"

/** Job-card stage for each booking that is still in the workshop, in booking order. */
const IN_WORKSHOP: JobCardStatus[] = [
  "inspection",
  "awaiting_approval",
  "quality_check",
  "ready_for_delivery",
]

/** Walk-in vehicles (not linked to a customer): [garage, status]. */
const WALK_INS: [string, JobCardStatus][] = [
  ["gar_004", "checked_in"],
  ["gar_003", "cancelled"],
  ["gar_005", "in_progress"],
]

const COMPLAINTS = [
  "Brake noise when stopping",
  "Pickup feels low",
  "Due for periodic service",
  "Headlamp flickers",
  "Vibration at high speed",
]
const STAGES: JobCardStatus[] = [
  "checked_in",
  "inspection",
  "awaiting_approval",
  "in_progress",
  "quality_check",
  "ready_for_delivery",
  "delivered",
]

function reached(status: JobCardStatus, stage: JobCardStatus): boolean {
  return status !== "cancelled" && STAGES.indexOf(status) >= STAGES.indexOf(stage)
}

function partsFor(vehicle: Vehicle) {
  const fitting = products.filter((product) =>
    product.fitment.some((fit) => fit.modelId === vehicle.modelId),
  )
  return fitting.length > 0
    ? fitting
    : products.filter((product) => product.vehicleTypes.includes(vehicle.vehicleType))
}

type JobInput = {
  id: string
  index: number
  garage: Garage
  vehicle: Vehicle
  customer: PartyRef | null
  bookingId: string | null
  labour: { name: string; price: number }[]
  status: JobCardStatus
  daysOld: number
}

function buildJobCard({
  id,
  index,
  garage,
  vehicle,
  customer,
  bookingId,
  labour,
  status,
  daysOld,
}: JobInput): JobCard {
  const random = seededRandom(100 + index)
  const advisor =
    garage.staff.find((member) => member.role === "service_advisor") ?? garage.staff[0]
  const by: ActorRef = {
    type: "garage",
    id: garage.id,
    name: advisor ? `${advisor.name}, ${garage.name}` : garage.name,
  }
  const checkedInAt = daysAgo(daysOld, 9, 40)
  const decidedAt = daysAgo(daysOld, 12, 15)

  const template = inspectionTemplates.find(
    (candidate) => candidate.vehicleType === vehicle.vehicleType,
  )
  const inspection: InspectionFinding[] =
    reached(status, "inspection") || status === "cancelled"
      ? (template?.sections ?? []).slice(0, 6).map(({ section, items }, i) => ({
          section,
          item: items[0]?.label ?? section,
          result: i === 1 ? "replace" : i === 3 ? "attention" : "ok",
          note:
            i === 1 ? "Worn beyond service limit." : i === 3 ? "Monitor at the next service." : "",
        }))
      : []

  const part = random.pick(partsFor(vehicle))
  const lines: Omit<EstimateItem, "approval" | "decidedAt">[] = [
    ...labour.map((service, i) => ({
      id: `${id}_e${i + 1}`,
      kind: "labour" as const,
      description: service.name,
      productId: null,
      quantity: 1,
      unitPrice: service.price,
      total: service.price,
    })),
    {
      id: `${id}_p1`,
      kind: "part",
      description: part.name,
      productId: part.id,
      quantity: 1,
      unitPrice: part.price,
      total: part.price,
    },
  ]
  const estimate: EstimateItem[] =
    reached(status, "awaiting_approval") || status === "cancelled"
      ? lines.map((line, i) => {
          const approval =
            status === "cancelled"
              ? "rejected"
              : status === "awaiting_approval" && line.kind === "part"
                ? "pending"
                : i === 1 && index % 3 === 0
                  ? "rejected"
                  : "approved"
          return { ...line, approval, decidedAt: approval === "pending" ? null : decidedAt }
        })
      : []

  const approvedTotal = estimate
    .filter((item) => item.approval === "approved")
    .reduce((sum, item) => sum + item.total, 0)
  const invoiced = reached(status, "ready_for_delivery")
  const { taxable, gst } = splitInclusiveGst(approvedTotal)
  const paid = status === "delivered"
  return {
    id,
    number: `JC-${3001 + index}`,
    garageId: garage.id,
    garageName: garage.name,
    bookingId,
    vehicleId: vehicle.id,
    vehicleLabel: vehicleLabel(vehicle),
    registrationNumber: vehicle.registrationNumber,
    customer,
    status,
    checkIn: {
      at: checkedInAt,
      by,
      odometerKm: vehicle.odometerKm,
      fuelLevel: random.pick(["quarter", "half", "three_quarters"] as const),
      complaints: [random.pick(COMPLAINTS)],
    },
    inspection,
    estimate,
    qualityCheck: reached(status, "ready_for_delivery")
      ? { passed: true, by, at: daysAgo(daysOld, 16, 30), notes: "Test ride done; no issues." }
      : null,
    invoice: invoiced
      ? {
          number: `${garage.name.split(" ")[0]?.toUpperCase()}/INV/${4100 + index}`,
          issuedAt: daysAgo(daysOld, 17),
          taxableAmount: taxable,
          gstAmount: gst,
          total: approvedTotal,
        }
      : null,
    payment: {
      status: paid ? "paid" : "unpaid",
      method: paid ? (index % 2 === 0 ? "online" : "at_garage") : null,
      paidAt: paid ? daysAgo(daysOld, 18) : null,
    },
    createdAt: checkedInAt,
    updatedAt: daysAgo(daysOld, 17),
  }
}

export const jobCards = persistent<JobCard[]>("job-cards", () => {
  const cards: JobCard[] = []
  let inWorkshop = 0
  for (const booking of bookings) {
    if (!booking.jobCardId) continue
    const garage = garages.find((candidate) => candidate.id === booking.garageId)
    const vehicle = vehicles.find((candidate) => candidate.id === booking.vehicleId)
    if (!garage || !vehicle) continue
    const status =
      booking.status === "completed" ? "delivered" : (IN_WORKSHOP[inWorkshop++] ?? "in_progress")
    const daysOld = Math.max(
      0,
      Math.round((Date.now() - new Date(booking.date).getTime()) / 86_400_000),
    )
    cards.push(
      buildJobCard({
        id: booking.jobCardId,
        index: cards.length,
        garage,
        vehicle,
        customer: booking.customer,
        bookingId: booking.id,
        labour: booking.services,
        status,
        daysOld,
      }),
    )
  }

  const walkIns = vehicles.filter((vehicle) => vehicle.ownerId === null)
  WALK_INS.forEach(([garageId, status], i) => {
    const garage = garages.find((candidate) => candidate.id === garageId)
    const vehicle = walkIns[i]
    const service = garage?.services.find(
      (candidate) => vehicle && candidate.vehicleTypes.includes(vehicle.vehicleType),
    )
    if (!garage || !vehicle || !service) return
    cards.push(
      buildJobCard({
        id: `jc_w${i + 1}`,
        index: cards.length,
        garage,
        vehicle,
        customer: null,
        bookingId: null,
        labour: [service],
        status,
        daysOld: i,
      }),
    )
  })
  return cards
})
