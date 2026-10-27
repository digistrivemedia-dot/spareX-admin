"use server"

import { BUSINESS_TYPE_LABELS } from "@/features/businesses/utils"
import * as api from "@/features/pricing/api"
import { discountSchema, type DiscountValues } from "@/features/pricing/schemas"
import { PRICING_FILTERS } from "@/features/pricing/utils"
import { exportCsv } from "@/lib/csv-export"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"

export async function setDiscountAction(values: DiscountValues) {
  return runValidatedMutation("pricing.manage", discountSchema, values, async (context, data) => {
    await api.setDiscount(context, data)
  })
}

export async function exportPricingAction(query: string) {
  const params = listParamsFromQuery(query, PRICING_FILTERS)
  const productId = new URLSearchParams(query).get("product")
  return exportCsv({
    entity: "business",
    label: "B2B pricing",
    load: (token) => api.allPricing(token, params, productId),
    columns: [
      { header: "Business", value: (row) => row.name },
      { header: "Type", value: (row) => BUSINESS_TYPE_LABELS[row.type] },
      { header: "Status", value: (row) => (row.status === "active" ? "Active" : "On hold") },
      { header: "Discount %", value: (row) => row.discountPercent },
      {
        header: "B2C price (₹, incl. GST)",
        value: (row) => (row.preview ? (row.preview.b2cPrice / 100).toFixed(2) : ""),
      },
      {
        header: "B2B price (₹, incl. GST)",
        value: (row) => (row.preview ? (row.preview.b2bPrice / 100).toFixed(2) : ""),
      },
    ],
  })
}
