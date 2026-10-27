"use server"

import * as api from "@/features/customers/api"
import { CUSTOMER_FILTERS } from "@/features/customers/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDate, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

export async function deactivateCustomerAction(id: string, reason: string) {
  return runValidatedMutation("customers.manage", reasonSchema, reason, (context, data) =>
    api.setCustomerActive(context, id, false, data),
  )
}

export async function reactivateCustomerAction(id: string) {
  return runMutation("customers.manage", (context) =>
    api.setCustomerActive(context, id, true, null),
  )
}

export async function deleteCustomerAction(id: string) {
  return runMutation("customers.manage", (context) => api.deleteCustomer(context, id))
}

export async function exportCustomersAction(query: string) {
  const params = listParamsFromQuery(query, CUSTOMER_FILTERS)
  return exportCsv({
    entity: "customer",
    label: "Customers",
    load: (token) => api.customersApi.all(token, params),
    columns: [
      { header: "Name", value: (row) => row.name },
      { header: "Email", value: (row) => row.email },
      { header: "Mobile", value: (row) => row.phone },
      { header: "City", value: (row) => row.city },
      { header: "Vehicles", value: (row) => row.vehicleCount },
      { header: "Orders", value: (row) => row.orderCount },
      { header: "Total spend (₹, incl. GST)", value: (row) => (row.totalSpend / 100).toFixed(2) },
      { header: "Joined", value: (row) => formatDate(row.createdAt) },
      { header: "Status", value: (row) => humanize(row.status) },
    ],
  })
}
