"use server"

import * as api from "@/features/enquiries/api"
import {
  enquiryStatusSchema,
  noteSchema,
  replySchema,
  type NoteValues,
  type ReplyValues,
} from "@/features/enquiries/schemas"
import type { EnquiryStatus } from "@/features/enquiries/types"
import { ENQUIRY_FILTERS, ENQUIRY_KIND_LABELS } from "@/features/enquiries/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"

export async function addEnquiryNoteAction(id: string, values: NoteValues) {
  return runValidatedMutation("enquiries.manage", noteSchema, values, (context, data) =>
    api.addEnquiryNote(context, id, data.text),
  )
}

export async function replyToEnquiryAction(id: string, values: ReplyValues) {
  return runValidatedMutation("enquiries.manage", replySchema, values, (context, data) =>
    api.replyToEnquiry(context, id, data.text, data.resolve),
  )
}

export async function setEnquiryStatusAction(id: string, status: EnquiryStatus) {
  return runValidatedMutation("enquiries.manage", enquiryStatusSchema, status, (context, data) =>
    api.setEnquiryStatus(context, id, data),
  )
}

export async function exportEnquiriesAction(query: string) {
  const params = listParamsFromQuery(query, ENQUIRY_FILTERS)
  return exportCsv({
    entity: "enquiry",
    label: "Enquiries",
    load: (token) => api.enquiriesApi.all(token, params),
    columns: [
      { header: "Number", value: (row) => row.number },
      { header: "Type", value: (row) => ENQUIRY_KIND_LABELS[row.kind] },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Name", value: (row) => row.name },
      { header: "Mobile", value: (row) => row.phone },
      {
        header: "Vehicle",
        value: (row) =>
          [row.vehicle.brand, row.vehicle.model, row.vehicle.variant, row.vehicle.year]
            .filter(Boolean)
            .join(" "),
      },
      { header: "Part wanted", value: (row) => row.partQuery ?? "" },
      { header: "Message", value: (row) => row.message },
      { header: "Received", value: (row) => formatDateTime(row.createdAt) },
    ],
  })
}
