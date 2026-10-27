import "server-only"

import type { Enquiry, EnquiryStatus } from "@/features/enquiries/types"
import { ApiError } from "@/lib/api-client"
import { humanize } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { enquiries } from "@/mocks/enquiries"
import { delay, listEndpoint, newId } from "@/mocks/utils"

/** Sorting by status puts open enquiries first. */
const STATUS_ORDER: Record<EnquiryStatus, number> = {
  new: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3,
}

export const enquiryEndpoint = listEndpoint<Enquiry>(() => enquiries, {
  searchText: (row) =>
    `${row.number} ${row.name} ${row.phone} ${row.vehicle.brand} ${row.vehicle.model} ${row.partQuery ?? ""}`,
  date: (row) => row.createdAt,
  filters: {
    kind: (row, value) => row.kind === value,
    status: (row, value) => row.status === value,
    vehicleType: (row, value) => row.vehicle.vehicleType === value,
  },
  sortValues: {
    createdAt: (row) => row.createdAt,
    status: (row) => STATUS_ORDER[row.status],
  },
})

function find(id: string): Enquiry {
  const enquiry = enquiries.find((candidate) => candidate.id === id)
  if (!enquiry) throw new ApiError("Enquiry not found.", 404)
  return enquiry
}

function audit(actor: ActorRef, enquiry: Enquiry, summary: string, before?: EnquiryStatus) {
  recordAuditEntry(actor, {
    action: before ? "status_change" : "update",
    entity: "enquiry",
    entityId: enquiry.id,
    entityLabel: enquiry.number,
    summary,
    changes:
      before && before !== enquiry.status
        ? [{ field: "Status", before: humanize(before), after: humanize(enquiry.status) }]
        : [],
  })
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  await delay()
  return enquiries.find((candidate) => candidate.id === id) ?? null
}

export async function addEnquiryNote(actor: ActorRef, id: string, text: string) {
  await delay()
  const enquiry = find(id)
  enquiry.notes.push({ id: newId("note"), at: new Date().toISOString(), by: actor, text })
  // Adding a note means someone is working on it.
  const before = enquiry.status
  if (enquiry.status === "new") enquiry.status = "in_progress"
  audit(actor, enquiry, "Added a note", before)
}

/** Sends the reply to the customer (by SMS / email once notifications exist) and can resolve the enquiry. */
export async function replyToEnquiry(actor: ActorRef, id: string, text: string, resolve: boolean) {
  await delay()
  const enquiry = find(id)
  const before = enquiry.status
  enquiry.reply = { text, at: new Date().toISOString(), by: actor }
  enquiry.status = resolve ? "resolved" : enquiry.status === "new" ? "in_progress" : enquiry.status
  audit(actor, enquiry, resolve ? "Replied and resolved" : "Replied to the customer", before)
}

export async function setEnquiryStatus(actor: ActorRef, id: string, status: EnquiryStatus) {
  await delay()
  const enquiry = find(id)
  const before = enquiry.status
  enquiry.status = status
  audit(actor, enquiry, `Marked ${humanize(status).toLowerCase()}`, before)
}
