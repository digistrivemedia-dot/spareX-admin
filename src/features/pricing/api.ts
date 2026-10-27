import "server-only"

import type { DiscountInput } from "@/features/pricing/schemas"
import type { PricingRow } from "@/features/pricing/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import { listParamsToQuery } from "@/lib/list-params"
import type { ListParams, Paginated, RequestContext } from "@/lib/types"
import * as mock from "@/mocks/pricing-api"

// B2B discounts are a business setting, so they follow the businesses data source.
const useMock = dataSource.businesses === "mock"

export async function listPricing(
  token: string,
  params: ListParams,
  productId: string | null,
): Promise<Paginated<PricingRow>> {
  if (useMock) return mock.listPricing(params, productId)
  return apiClient.get("/b2b-pricing", {
    token,
    query: { ...listParamsToQuery(params), product: productId ?? undefined },
  })
}

export async function allPricing(
  token: string,
  params: ListParams,
  productId: string | null,
): Promise<PricingRow[]> {
  if (useMock) return mock.allPricing(params, productId)
  return apiClient.get("/b2b-pricing/all", {
    token,
    query: { ...listParamsToQuery(params), product: productId ?? undefined },
  })
}

export async function setDiscount(context: RequestContext, input: DiscountInput) {
  if (useMock) return mock.setDiscount(context.actor, input.businessIds, input.percent)
  return apiClient.post("/b2b-pricing/discount", input, { token: context.token })
}
