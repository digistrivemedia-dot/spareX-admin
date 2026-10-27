"use server"

import * as api from "@/features/returns/api"
import {
  pickupSchema,
  verifySchema,
  type PickupValues,
  type VerifyValues,
} from "@/features/returns/schemas"
import { RETURN_FILTERS, returnAmount } from "@/features/returns/utils"
import { storeImage } from "@/features/uploads/api"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

export async function approveReturnAction(id: string) {
  return runMutation("returns.manage", (context) => api.approveReturn(context, id))
}

export async function rejectReturnAction(id: string, reason: string) {
  return runValidatedMutation("returns.manage", reasonSchema, reason, (context, data) =>
    api.rejectReturn(context, id, data),
  )
}

export async function schedulePickupAction(id: string, values: PickupValues) {
  return runValidatedMutation("returns.manage", pickupSchema, values, (context, data) =>
    api.schedulePickup(context, id, data),
  )
}

export async function verifyReturnAction(id: string, values: VerifyValues) {
  return runValidatedMutation("returns.manage", verifySchema, values, async (context, data) => {
    const photos = await Promise.all(data.photos.map((photo) => storeImage(context, photo)))
    await api.verifyReturn(context, id, {
      ...data,
      photos: photos.filter((url): url is string => url !== null),
    })
  })
}

export async function resolveReturnAction(id: string) {
  return runMutation("returns.manage", (context) => api.resolveReturn(context, id))
}

export async function closeReturnAction(id: string) {
  return runMutation("returns.manage", (context) => api.closeReturn(context, id))
}

export async function exportReturnsAction(query: string) {
  const params = listParamsFromQuery(query, RETURN_FILTERS)
  return exportCsv({
    entity: "return",
    label: "Returns",
    load: (token) => api.returnsApi.all(token, params),
    columns: [
      { header: "Request", value: (row) => row.number },
      { header: "Type", value: (row) => humanize(row.kind) },
      { header: "Requested", value: (row) => formatDateTime(row.requestedAt) },
      { header: "Order", value: (row) => row.orderNumber },
      { header: "Customer", value: (row) => row.customer.name },
      { header: "Reason", value: (row) => humanize(row.reason) },
      { header: "Amount (₹, incl. GST)", value: (row) => (returnAmount(row) / 100).toFixed(2) },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Resolution", value: (row) => row.resolution?.reference ?? "" },
    ],
  })
}
