"use server"

import { z } from "zod"

import * as api from "@/features/garages/api"
import { GARAGE_FILTERS, PAYOUT_FILTERS } from "@/features/garages/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDate, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

const referenceSchema = z.string().trim().min(3, "Enter the UTR or bank reference.").max(60)

export async function goLiveAction(id: string) {
  return runMutation("garages.manage", (context) => api.setGarageLive(context, id, true, null))
}

export async function takeOfflineAction(id: string, reason: string) {
  return runValidatedMutation("garages.manage", reasonSchema, reason, (context, data) =>
    api.setGarageLive(context, id, false, data),
  )
}

export async function settlePayoutAction(garageId: string, reference: string) {
  return runValidatedMutation("payouts.manage", referenceSchema, reference, (context, data) =>
    api.settlePayout(context, garageId, data),
  )
}

export async function exportGaragesAction(query: string) {
  const params = listParamsFromQuery(query, GARAGE_FILTERS)
  return exportCsv({
    entity: "garage",
    label: "Garages",
    load: (token) => api.garagesApi.all(token, params),
    columns: [
      { header: "Garage", value: (row) => row.name },
      {
        header: "Ownership",
        value: (row) => (row.ownership === "kannali" ? "Kannali-owned" : "Partner"),
      },
      { header: "City", value: (row) => row.city },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Rating", value: (row) => (row.ratingCount ? row.rating : "") },
      { header: "Reviews", value: (row) => row.ratingCount },
      { header: "Services", value: (row) => row.serviceCount },
      { header: "Pick and drop", value: (row) => (row.pickAndDrop ? "Yes" : "No") },
      { header: "Approved", value: (row) => formatDate(row.approvedAt) },
    ],
  })
}

export async function exportPayoutsAction(query: string) {
  const params = listParamsFromQuery(query, PAYOUT_FILTERS)
  return exportCsv({
    entity: "garage",
    label: "Garage payouts",
    load: (token) => api.payoutsApi.all(token, params),
    columns: [
      { header: "Garage", value: (row) => row.garageName },
      { header: "Online payments due", value: (row) => row.unsettledCount },
      { header: "Due (₹)", value: (row) => (row.unsettledAmount / 100).toFixed(2) },
      { header: "Settled so far (₹)", value: (row) => (row.settledAmount / 100).toFixed(2) },
      {
        header: "Last settled",
        value: (row) => (row.lastSettledAt ? formatDate(row.lastSettledAt) : ""),
      },
      { header: "Last reference", value: (row) => row.lastReference ?? "" },
    ],
  })
}
