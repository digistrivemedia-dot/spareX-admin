"use server"

import * as api from "@/features/credit-notes/api"
import { APPLIED_TO_LABELS, CREDIT_NOTE_FILTERS } from "@/features/credit-notes/utils"
import { CHANNEL_LABELS } from "@/features/orders/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"

const rupees = (paise: number) => (paise / 100).toFixed(2)

export async function exportCreditNotesAction(query: string) {
  const params = listParamsFromQuery(query, CREDIT_NOTE_FILTERS)
  return exportCsv({
    entity: "credit_note",
    label: "Credit notes",
    load: (token) => api.creditNotesApi.all(token, params),
    columns: [
      { header: "Credit note", value: (row) => row.number },
      { header: "Issued", value: (row) => formatDateTime(row.issuedAt) },
      { header: "Channel", value: (row) => CHANNEL_LABELS[row.channel] },
      { header: "Customer", value: (row) => row.customer.name },
      { header: "Order", value: (row) => row.orderNumber },
      { header: "Return", value: (row) => row.returnNumber ?? "" },
      { header: "Taxable (₹)", value: (row) => rupees(row.taxableAmount) },
      { header: "GST (₹)", value: (row) => rupees(row.gstAmount) },
      { header: "Amount (₹)", value: (row) => rupees(row.amount) },
      { header: "Applied to", value: (row) => APPLIED_TO_LABELS[row.appliedTo] },
      { header: "Reason", value: (row) => row.reason },
    ],
  })
}
