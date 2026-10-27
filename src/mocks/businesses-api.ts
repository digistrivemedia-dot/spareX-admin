import "server-only"

import type { ApproveInput } from "@/features/businesses/schemas"
import type {
  ApplicationStatus,
  Business,
  BusinessApplication,
  BusinessDetail,
  BusinessListItem,
} from "@/features/businesses/types"
import { ApiError } from "@/lib/api-client"
import { formatPercent, humanize } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { applications, businesses } from "@/mocks/businesses"
import { creditAccountFor, enableCredit } from "@/mocks/credit-api"
import { orders } from "@/mocks/orders"
import { quotations } from "@/mocks/quotations"
import { returns } from "@/mocks/returns"
import { delay, listEndpoint, newId } from "@/mocks/utils"

const WAITING: ApplicationStatus[] = ["submitted", "under_review"]

// Applications (A13, A14)

export const applicationEndpoint = listEndpoint<BusinessApplication>(() => applications, {
  searchText: (row) =>
    `${row.number} ${row.businessName} ${row.contactName} ${row.gstin} ${row.address.city}`,
  date: (row) => row.submittedAt,
  filters: {
    // "waiting" is the dashboard's "Applications waiting": submitted or under review.
    status: (row, value) =>
      value === "waiting" ? WAITING.includes(row.status) : row.status === value,
    type: (row, value) => row.type === value,
  },
  sortValues: { submittedAt: (row) => row.submittedAt, businessName: (row) => row.businessName },
})

export async function getApplication(id: string): Promise<BusinessApplication | null> {
  await delay()
  return applications.find((candidate) => candidate.id === id) ?? null
}

function findApplication(id: string, allowed: ApplicationStatus[]): BusinessApplication {
  const application = applications.find((candidate) => candidate.id === id)
  if (!application) throw new ApiError("Application not found.", 404)
  if (!allowed.includes(application.status)) {
    throw new ApiError(
      `This application is already ${humanize(application.status).toLowerCase()}.`,
      409,
    )
  }
  return application
}

function moveApplication(
  actor: ActorRef,
  application: BusinessApplication,
  status: ApplicationStatus,
  note: string | null,
) {
  const before = application.status
  application.status = status
  application.history.push({
    status,
    at: new Date().toISOString(),
    by: actor,
    note: note ?? undefined,
  })
  recordAuditEntry(actor, {
    action: status === "approved" ? "approve" : status === "rejected" ? "reject" : "status_change",
    entity: "application",
    entityId: application.id,
    entityLabel: application.businessName,
    summary: `${humanize(status)}${note ? `: ${note}` : ""}`,
    changes: [{ field: "Status", before: humanize(before), after: humanize(status) }],
  })
}

export async function startReview(actor: ActorRef, id: string) {
  await delay()
  moveApplication(actor, findApplication(id, ["submitted"]), "under_review", null)
}

/** Creates the verified business (and its credit account when asked) from the application. */
export async function approveApplication(
  actor: ActorRef,
  id: string,
  input: ApproveInput,
): Promise<Business> {
  await delay()
  const application = findApplication(id, WAITING)
  if (businesses.some((business) => business.gstin === application.gstin)) {
    throw new ApiError("A business with this GSTIN is already verified.", 409)
  }
  const business: Business = {
    id: newId("bus"),
    name: application.businessName,
    type: application.type,
    gstin: application.gstin,
    pan: application.pan,
    ownerName: application.contactName,
    phone: application.phone,
    email: application.email,
    address: application.address,
    location: application.location,
    branches: [],
    users: [
      {
        id: newId("usr"),
        name: application.contactName,
        email: application.email,
        phone: application.phone,
        role: "owner",
        active: true,
      },
    ],
    discountPercent: input.discountPercent,
    status: "active",
    holdReason: null,
    applicationId: application.id,
    approvedAt: new Date().toISOString(),
  }
  businesses.push(business)
  application.businessId = business.id
  moveApplication(
    actor,
    application,
    "approved",
    `Discount ${formatPercent(input.discountPercent)}${input.credit ? ", credit enabled" : ""}`,
  )
  if (input.credit) await enableCredit(actor, business.id, input.credit)
  return business
}

export async function sendBackApplication(
  actor: ActorRef,
  id: string,
  fields: string[],
  note: string,
) {
  await delay()
  const application = findApplication(id, WAITING)
  application.sentBackFields = fields
  application.note = note
  moveApplication(actor, application, "sent_back", note)
}

export async function rejectApplication(actor: ActorRef, id: string, reason: string) {
  await delay()
  const application = findApplication(id, [...WAITING, "sent_back"])
  application.rejectionReason = reason
  moveApplication(actor, application, "rejected", reason)
}

// Businesses (A15, A16)

function businessRow(business: Business): BusinessListItem {
  return {
    ...business,
    city: business.address.city,
    creditStatus: creditAccountFor(business.id)?.status ?? null,
    orderCount: orders.filter((order) => order.customer.id === business.id).length,
  }
}

export const businessEndpoint = listEndpoint<BusinessListItem>(() => businesses.map(businessRow), {
  searchText: (row) => `${row.name} ${row.ownerName} ${row.gstin} ${row.city}`,
  filters: {
    type: (row, value) => row.type === value,
    status: (row, value) => row.status === value,
    credit: (row, value) =>
      value === "on"
        ? row.creditStatus !== null && row.creditStatus !== "disabled"
        : row.creditStatus === null || row.creditStatus === "disabled",
  },
  sortValues: {
    name: (row) => row.name,
    approvedAt: (row) => row.approvedAt,
    discountPercent: (row) => row.discountPercent,
    orderCount: (row) => row.orderCount,
  },
})

export async function businessOptions(): Promise<{ id: string; name: string }[]> {
  return businesses.map(({ id, name }) => ({ id, name }))
}

export async function getBusiness(id: string): Promise<BusinessDetail | null> {
  await delay()
  const business = businesses.find((candidate) => candidate.id === id)
  if (!business) return null
  return {
    ...businessRow(business),
    creditAccountId: creditAccountFor(id)?.id ?? null,
    orders: orders
      .filter((order) => order.customer.id === id)
      .map(({ id, number, placedAt, status, total }) => ({ id, number, placedAt, status, total })),
    quotations: quotations
      .filter((quote) => quote.businessId === id)
      .map(({ id, number, createdAt, status, total }) => ({
        id,
        number,
        createdAt,
        status,
        total,
      })),
    returns: returns
      .filter((item) => item.customer.id === id)
      .map(({ id, number, kind, status, requestedAt }) => ({
        id,
        number,
        kind,
        status,
        requestedAt,
      })),
  }
}

/** A hold blocks the business from ordering on B2B until released. */
export async function setBusinessHold(
  actor: ActorRef,
  id: string,
  hold: boolean,
  reason: string | null,
) {
  await delay()
  const business = businesses.find((candidate) => candidate.id === id)
  if (!business) throw new ApiError("Business not found.", 404)
  const before = business.status
  business.status = hold ? "on_hold" : "active"
  business.holdReason = hold ? reason : null
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "business",
    entityId: business.id,
    entityLabel: business.name,
    summary: hold ? `Put account on hold: ${reason}` : "Released account",
    changes: [{ field: "Status", before: humanize(before), after: humanize(business.status) }],
  })
}
