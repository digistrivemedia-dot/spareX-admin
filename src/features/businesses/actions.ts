"use server"

import * as api from "@/features/businesses/api"
import {
  approveSchema,
  sendBackSchema,
  type ApproveValues,
  type SendBackValues,
} from "@/features/businesses/schemas"
import {
  APPLICATION_FILTERS,
  BUSINESS_FILTERS,
  BUSINESS_TYPE_LABELS,
} from "@/features/businesses/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDate, formatPercent, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

export async function startReviewAction(id: string) {
  return runMutation("businesses.manage", (context) => api.startReview(context, id))
}

export async function approveApplicationAction(id: string, values: ApproveValues) {
  return runValidatedMutation("businesses.manage", approveSchema, values, async (context, data) => {
    const business = await api.approveApplication(context, id, {
      discountPercent: data.discountPercent,
      credit: data.enableCredit
        ? { limit: Math.round(Number(data.creditLimit) * 100), termsDays: Number(data.termsDays) }
        : null,
    })
    return { businessId: business.id }
  })
}

export async function sendBackApplicationAction(id: string, values: SendBackValues) {
  return runValidatedMutation("businesses.manage", sendBackSchema, values, (context, data) =>
    api.sendBackApplication(context, id, data.fields, data.note),
  )
}

export async function rejectApplicationAction(id: string, reason: string) {
  return runValidatedMutation("businesses.manage", reasonSchema, reason, (context, data) =>
    api.rejectApplication(context, id, data),
  )
}

export async function holdBusinessAction(id: string, reason: string) {
  return runValidatedMutation("businesses.manage", reasonSchema, reason, (context, data) =>
    api.setBusinessHold(context, id, true, data),
  )
}

export async function releaseBusinessAction(id: string) {
  return runMutation("businesses.manage", (context) =>
    api.setBusinessHold(context, id, false, null),
  )
}

export async function exportApplicationsAction(query: string) {
  const params = listParamsFromQuery(query, APPLICATION_FILTERS)
  return exportCsv({
    entity: "application",
    label: "Applications",
    load: (token) => api.applicationsApi.all(token, params),
    columns: [
      { header: "Number", value: (row) => row.number },
      { header: "Business", value: (row) => row.businessName },
      { header: "Type", value: (row) => BUSINESS_TYPE_LABELS[row.type] },
      { header: "GSTIN", value: (row) => row.gstin },
      { header: "Contact", value: (row) => row.contactName },
      { header: "City", value: (row) => row.address.city },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Submitted", value: (row) => formatDate(row.submittedAt) },
    ],
  })
}

export async function exportBusinessesAction(query: string) {
  const params = listParamsFromQuery(query, BUSINESS_FILTERS)
  return exportCsv({
    entity: "business",
    label: "Businesses",
    load: (token) => api.businessesApi.all(token, params),
    columns: [
      { header: "Business", value: (row) => row.name },
      { header: "Type", value: (row) => BUSINESS_TYPE_LABELS[row.type] },
      { header: "GSTIN", value: (row) => row.gstin },
      { header: "Owner", value: (row) => row.ownerName },
      { header: "City", value: (row) => row.city },
      { header: "Discount", value: (row) => formatPercent(row.discountPercent) },
      { header: "Credit", value: (row) => (row.creditStatus ? humanize(row.creditStatus) : "Off") },
      { header: "Orders", value: (row) => row.orderCount },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Approved", value: (row) => formatDate(row.approvedAt) },
    ],
  })
}
