"use server"

import * as api from "@/features/job-cards/api"
import { JOB_CARD_FILTERS, jobCardValue } from "@/features/job-cards/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"

export async function exportJobCardsAction(query: string) {
  const params = listParamsFromQuery(query, JOB_CARD_FILTERS)
  return exportCsv({
    entity: "booking",
    label: "Job cards",
    load: (token) => api.jobCardsApi.all(token, params),
    columns: [
      { header: "Job card", value: (row) => row.number },
      { header: "Garage", value: (row) => row.garageName },
      { header: "Vehicle", value: (row) => `${row.registrationNumber} ${row.vehicleLabel}` },
      { header: "Customer", value: (row) => row.customer?.name ?? "Walk-in" },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Checked in", value: (row) => formatDateTime(row.checkIn.at) },
      { header: "Value (₹, incl. GST)", value: (row) => (jobCardValue(row) / 100).toFixed(2) },
      { header: "Payment", value: (row) => humanize(row.payment.status) },
    ],
  })
}
