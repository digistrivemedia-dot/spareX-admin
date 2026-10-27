import "server-only"

import type { PricingRow } from "@/features/pricing/types"
import { formatPercent } from "@/lib/format"
import { applyDiscount } from "@/lib/gst"
import type { ActorRef, ListParams } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { businesses } from "@/mocks/businesses"
import { products } from "@/mocks/catalog"
import { delay, filterRows, queryList, type QueryOptions } from "@/mocks/utils"

function rows(productId: string | null): PricingRow[] {
  const product = products.find((candidate) => candidate.id === productId)
  return businesses.map((business) => ({
    businessId: business.id,
    name: business.name,
    type: business.type,
    status: business.status,
    discountPercent: business.discountPercent,
    preview: product
      ? {
          b2cPrice: product.price,
          b2bPrice: applyDiscount(product.price, business.discountPercent),
        }
      : null,
  }))
}

const PRICING_QUERY: QueryOptions<PricingRow> = {
  searchText: (row) => row.name,
  filters: {
    type: (row, value) => row.type === value,
    status: (row, value) => row.status === value,
  },
  sortValues: { name: (row) => row.name, discountPercent: (row) => row.discountPercent },
}

export async function listPricing(params: ListParams, productId: string | null) {
  await delay()
  return queryList(rows(productId), params, PRICING_QUERY)
}

export async function allPricing(params: ListParams, productId: string | null) {
  await delay()
  return filterRows(rows(productId), params, PRICING_QUERY)
}

/** Sets one discount % for each chosen business; each change is audited on the business. */
export async function setDiscount(actor: ActorRef, businessIds: string[], percent: number) {
  await delay()
  for (const business of businesses.filter((candidate) => businessIds.includes(candidate.id))) {
    if (business.discountPercent === percent) continue
    recordAuditEntry(actor, {
      action: "update",
      entity: "business",
      entityId: business.id,
      entityLabel: business.name,
      summary: "Changed B2B discount",
      changes: [
        {
          field: "Discount",
          before: formatPercent(business.discountPercent),
          after: formatPercent(percent),
        },
      ],
    })
    business.discountPercent = percent
  }
}
