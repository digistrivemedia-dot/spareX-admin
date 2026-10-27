import "server-only"

import type { CouponInput } from "@/features/coupons/schemas"
import type { Coupon, CouponScopeOptions } from "@/features/coupons/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/coupons-api"

const useMock = dataSource.coupons === "mock"

export const couponsApi = listEndpoint<Coupon>(dataSource.coupons, "/coupons", mock.couponEndpoint)

export async function getCoupon(token: string, id: string): Promise<Coupon | null> {
  return useMock ? mock.getCoupon(id) : apiClient.get(`/coupons/${id}`, { token })
}

export async function getCouponScopeOptions(token: string): Promise<CouponScopeOptions> {
  return useMock ? mock.couponScopeOptions() : apiClient.get("/coupons/scope-options", { token })
}

export async function saveCoupon(
  { actor, token }: RequestContext,
  id: string | null,
  input: CouponInput,
): Promise<{ id: string }> {
  if (useMock) return mock.saveCoupon(actor, id, input)
  return id
    ? apiClient.patch(`/coupons/${id}`, input, { token })
    : apiClient.post("/coupons", input, { token })
}
