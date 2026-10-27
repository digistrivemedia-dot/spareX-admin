import "server-only"

import type { Customer, CustomerDetail, CustomerListItem } from "@/features/customers/types"
import type { Vehicle, VehicleDetail, VehicleListItem } from "@/features/vehicles/types"
import { ApiError } from "@/lib/api-client"
import type { ActorRef, IsoDate } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { bookings } from "@/mocks/bookings"
import { customers } from "@/mocks/customers"
import { enquiries } from "@/mocks/enquiries"
import { jobCards } from "@/mocks/job-cards"
import { vehicleBrands, vehicleModels, vehicleVariants } from "@/mocks/masters"
import { orders } from "@/mocks/orders"
import { returns } from "@/mocks/returns"
import { delay, listEndpoint } from "@/mocks/utils"
import { vehicles } from "@/mocks/vehicles"

function findCustomer(id: string): Customer {
  const customer = customers.find((candidate) => candidate.id === id)
  if (!customer) throw new ApiError("Customer not found.", 404)
  return customer
}

function customerRow(customer: Customer): CustomerListItem {
  const own = orders.filter(
    (order) => order.customer.id === customer.id && order.status !== "cancelled",
  )
  return {
    ...customer,
    city:
      customer.addresses.find((address) => address.isDefault)?.city ??
      customer.addresses[0]?.city ??
      "",
    vehicleCount: vehicles.filter((vehicle) => vehicle.ownerId === customer.id).length,
    orderCount: orders.filter((order) => order.customer.id === customer.id).length,
    totalSpend: own.reduce((sum, order) => sum + order.total - order.payment.refundedAmount, 0),
  }
}

export const customerEndpoint = listEndpoint<CustomerListItem>(() => customers.map(customerRow), {
  searchText: (row) => `${row.name} ${row.email} ${row.phone}`,
  date: (row) => row.createdAt,
  filters: {
    status: (row, value) => row.status === value,
    city: (row, value) => row.city === value,
  },
  sortValues: {
    name: (row) => row.name,
    createdAt: (row) => row.createdAt,
    lastActiveAt: (row) => row.lastActiveAt,
    orderCount: (row) => row.orderCount,
    totalSpend: (row) => row.totalSpend,
  },
})

function vehicleRow(vehicle: Vehicle): VehicleListItem {
  return {
    ...vehicle,
    brandName: vehicleBrands.find((brand) => brand.id === vehicle.brandId)?.name ?? "",
    modelName: vehicleModels.find((model) => model.id === vehicle.modelId)?.name ?? "",
    variantName: vehicleVariants.find((variant) => variant.id === vehicle.variantId)?.name ?? "",
    ownerName: customers.find((customer) => customer.id === vehicle.ownerId)?.name ?? null,
  }
}

export async function getCustomer(id: string): Promise<CustomerDetail | null> {
  await delay()
  const customer = customers.find((candidate) => candidate.id === id)
  if (!customer) return null
  const mine = <T extends { customer: { id: string } | null }>(rows: T[]) =>
    rows.filter((row) => row.customer?.id === id)
  return {
    ...customerRow(customer),
    vehicles: vehicles.filter((vehicle) => vehicle.ownerId === id).map(vehicleRow),
    orders: mine(orders).map(({ id, number, placedAt, status, total }) => ({
      id,
      number,
      placedAt,
      status,
      total,
    })),
    returns: mine(returns).map(({ id, number, kind, status, requestedAt }) => ({
      id,
      number,
      kind,
      status,
      requestedAt,
    })),
    bookings: mine(bookings).map(({ id, number, date, garageName, status }) => ({
      id,
      number,
      date,
      garageName,
      status,
    })),
    enquiries: enquiries
      .filter((enquiry) => enquiry.customerId === id)
      .map(({ id, number, kind, status, createdAt }) => ({ id, number, kind, status, createdAt })),
  }
}

export async function customerCities(): Promise<string[]> {
  return [
    ...new Set(customers.map((customer) => customerRow(customer).city).filter(Boolean)),
  ].sort()
}

function auditCustomer(
  actor: ActorRef,
  customer: Customer,
  summary: string,
  before: string,
  after: string,
) {
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "customer",
    entityId: customer.id,
    entityLabel: customer.name,
    summary,
    changes: [{ field: "Status", before, after }],
  })
}

export async function setCustomerActive(
  actor: ActorRef,
  id: string,
  active: boolean,
  reason: string | null,
) {
  await delay()
  const customer = findCustomer(id)
  if (customer.status === "deleted") throw new ApiError("This account has been deleted.", 409)
  const before = customer.status
  customer.status = active ? "active" : "inactive"
  customer.deactivationReason = active ? null : reason
  auditCustomer(
    actor,
    customer,
    active ? "Reactivated account" : `Deactivated account: ${reason}`,
    before,
    customer.status,
  )
}

/** Processes a DPDP deletion request: erases personal details; orders and invoices stay for tax law. */
export async function deleteCustomer(actor: ActorRef, id: string) {
  await delay()
  const customer = findCustomer(id)
  if (customer.status !== "deletion_requested")
    throw new ApiError("The customer hasn't asked for deletion.", 409)
  auditCustomer(
    actor,
    customer,
    "Deleted account on the customer's request (DPDP)",
    customer.status,
    "deleted",
  )
  Object.assign(customer, {
    name: "Deleted customer",
    email: "",
    phone: "",
    addresses: [],
    status: "deleted",
  })
  for (const vehicle of vehicles.filter((candidate) => candidate.ownerId === id))
    vehicle.ownerId = null
}

// Vehicles (A11, A12)

export const vehicleEndpoint = listEndpoint<VehicleListItem>(() => vehicles.map(vehicleRow), {
  searchText: (row) =>
    `${row.registrationNumber} ${row.brandName} ${row.modelName} ${row.ownerName ?? ""} ${row.chassisNumber}`,
  date: (row) => row.createdAt,
  filters: {
    type: (row, value) => row.vehicleType === value,
    brand: (row, value) => row.brandId === value,
    model: (row, value) => row.modelId === value,
    fuel: (row, value) => row.fuel === value,
    owner: (row, value) => (value === "walk_in" ? row.ownerId === null : row.ownerId !== null),
  },
  sortValues: {
    registrationNumber: (row) => row.registrationNumber,
    vehicle: (row) => `${row.brandName} ${row.modelName}`,
    year: (row) => row.year,
    createdAt: (row) => row.createdAt,
  },
})

export async function getVehicle(id: string): Promise<VehicleDetail | null> {
  await delay()
  const vehicle = vehicles.find((candidate) => candidate.id === id)
  if (!vehicle) return null
  const cards = jobCards
    .filter((card) => card.vehicleId === id)
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
  return {
    ...vehicleRow(vehicle),
    serviceHistory: cards.map((card) => ({
      jobCardId: card.id,
      jobCardNumber: card.number,
      garageName: card.garageName,
      date: card.checkIn.at,
      odometerKm: card.checkIn.odometerKm,
      status: card.status,
      work: card.estimate
        .filter((item) => item.approval === "approved")
        .map((item) => item.description),
      total: card.invoice?.total ?? null,
    })),
    partsInstalled: cards.flatMap((card) =>
      card.status === "delivered"
        ? card.estimate
            .filter((item) => item.kind === "part" && item.approval === "approved")
            .map((item) => ({
              jobCardId: card.id,
              jobCardNumber: card.number,
              date: card.updatedAt,
              garageName: card.garageName,
              description: item.description,
              productId: item.productId,
              quantity: item.quantity,
            }))
        : [],
    ),
    invoices: cards.flatMap((card) =>
      card.invoice
        ? [
            {
              jobCardId: card.id,
              number: card.invoice.number,
              issuedAt: card.invoice.issuedAt,
              garageName: card.garageName,
              total: card.invoice.total,
            },
          ]
        : [],
    ),
  }
}

/** Moves a vehicle to a new owner (or links a walk-in). The full history moves with it (Q-04). */
export async function transferVehicle(
  actor: ActorRef,
  id: string,
  customerId: string,
  date: IsoDate,
) {
  await delay()
  const vehicle = vehicles.find((candidate) => candidate.id === id)
  if (!vehicle) throw new ApiError("Vehicle not found.", 404)
  const buyer = findCustomer(customerId)
  if (buyer.status === "deleted")
    throw new ApiError("Check the highlighted field.", 422, {
      customerId: ["This account was deleted."],
    })
  if (vehicle.ownerId === customerId)
    throw new ApiError("Check the highlighted field.", 422, {
      customerId: ["This customer already owns the vehicle."],
    })
  const current = vehicle.owners.find((owner) => owner.to === null)
  if (current && date < current.from)
    throw new ApiError("Check the highlighted field.", 422, {
      date: ["The date can't be before the current owner got the vehicle."],
    })
  const previous = vehicleRow(vehicle).ownerName ?? "Walk-in (not linked)"
  if (current) current.to = date
  vehicle.owners.push({ customerId: buyer.id, customerName: buyer.name, from: date, to: null })
  vehicle.ownerId = buyer.id
  recordAuditEntry(actor, {
    action: "update",
    entity: "vehicle",
    entityId: vehicle.id,
    entityLabel: vehicle.registrationNumber,
    summary: current ? "Transferred to a new owner" : "Linked walk-in vehicle to a customer",
    changes: [{ field: "Owner", before: previous, after: buyer.name }],
  })
}
