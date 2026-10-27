"use server"

import * as api from "@/features/quotations/api"
import { quotationSchema, type QuotationValues } from "@/features/quotations/schemas"
import { QUOTATION_FILTERS } from "@/features/quotations/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDate, formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"

export async function sendQuotationAction(id: string, values: QuotationValues) {
  return runValidatedMutation("quotations.manage", quotationSchema, values, (context, data) =>
    api.sendQuotation(context, id, data),
  )
}

export async function exportQuotationsAction(query: string) {
  const params = listParamsFromQuery(query, QUOTATION_FILTERS)
  return exportCsv({
    entity: "quotation",
    label: "Quotations",
    load: (token) => api.quotationsApi.all(token, params),
    columns: [
      { header: "Quotation", value: (row) => row.number },
      { header: "Business", value: (row) => row.businessName },
      { header: "Requested", value: (row) => formatDateTime(row.createdAt) },
      { header: "Lines", value: (row) => row.lines.length },
      { header: "Total (₹, incl. GST)", value: (row) => (row.total / 100).toFixed(2) },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Valid until", value: (row) => (row.validUntil ? formatDate(row.validUntil) : "") },
    ],
  })
}
