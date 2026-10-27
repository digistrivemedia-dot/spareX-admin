"use server"

import {
  creditTermsSchema,
  paymentSchema,
  type CreditTermsValues,
  type PaymentValues,
} from "@/features/businesses/schemas"
import * as api from "@/features/credit/api"
import { CREDIT_FILTERS } from "@/features/credit/utils"
import { exportCsv } from "@/lib/csv-export"
import { humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"
import { reason as reasonSchema } from "@/lib/validation"

export async function enableCreditAction(businessId: string, values: CreditTermsValues) {
  return runValidatedMutation("credit.manage", creditTermsSchema, values, (context, data) =>
    api.enableCredit(context, businessId, data),
  )
}

export async function updateCreditTermsAction(id: string, values: CreditTermsValues) {
  return runValidatedMutation("credit.manage", creditTermsSchema, values, (context, data) =>
    api.updateCreditTerms(context, id, data),
  )
}

export async function holdCreditAction(id: string, reason: string) {
  return runValidatedMutation("credit.manage", reasonSchema, reason, (context, data) =>
    api.setCreditStatus(context, id, "on_hold", data),
  )
}

export async function releaseCreditAction(id: string) {
  return runMutation("credit.manage", (context) => api.setCreditStatus(context, id, "active", null))
}

export async function disableCreditAction(id: string) {
  return runMutation("credit.manage", (context) =>
    api.setCreditStatus(context, id, "disabled", null),
  )
}

export async function recordPaymentAction(id: string, values: PaymentValues) {
  return runValidatedMutation("credit.manage", paymentSchema, values, (context, data) =>
    api.recordCreditPayment(context, id, data),
  )
}

export async function exportCreditAccountsAction(query: string) {
  const params = listParamsFromQuery(query, CREDIT_FILTERS)
  const rupees = (paise: number) => (paise / 100).toFixed(2)
  return exportCsv({
    entity: "credit",
    label: "Credit accounts",
    load: (token) => api.creditApi.all(token, params),
    columns: [
      { header: "Business", value: (row) => row.businessName },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "Limit (₹)", value: (row) => rupees(row.limit) },
      { header: "Used (₹)", value: (row) => rupees(row.outstanding) },
      { header: "Available (₹)", value: (row) => rupees(row.available) },
      { header: "Overdue (₹)", value: (row) => rupees(row.overdue) },
      { header: "Terms (days)", value: (row) => row.termsDays },
    ],
  })
}
