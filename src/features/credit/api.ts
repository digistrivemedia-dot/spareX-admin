import "server-only"

import type { CreditTermsInput, PaymentInput } from "@/features/businesses/schemas"
import type { CreditAccountDetail, CreditAccountListItem } from "@/features/businesses/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/credit-api"

// Credit belongs to B2B businesses, so it follows the businesses data source.
const useMock = dataSource.businesses === "mock"

export const creditApi = listEndpoint<CreditAccountListItem>(
  dataSource.businesses,
  "/credit-accounts",
  mock.creditEndpoint,
)

export async function getCreditAccount(
  token: string,
  id: string,
): Promise<CreditAccountDetail | null> {
  return useMock ? mock.getCreditAccount(id) : apiClient.get(`/credit-accounts/${id}`, { token })
}

export async function enableCredit(
  { actor, token }: RequestContext,
  businessId: string,
  terms: CreditTermsInput,
) {
  if (useMock) return mock.enableCredit(actor, businessId, terms)
  return apiClient.post(`/businesses/${businessId}/credit`, terms, { token })
}

export async function updateCreditTerms(
  { actor, token }: RequestContext,
  id: string,
  terms: CreditTermsInput,
) {
  if (useMock) return mock.updateCreditTerms(actor, id, terms)
  return apiClient.patch(`/credit-accounts/${id}`, terms, { token })
}

export async function setCreditStatus(
  { actor, token }: RequestContext,
  id: string,
  status: "on_hold" | "disabled" | "active",
  reason: string | null,
) {
  if (useMock) return mock.setCreditStatus(actor, id, status, reason)
  return apiClient.patch(`/credit-accounts/${id}/status`, { status, reason }, { token })
}

export async function recordCreditPayment(
  { actor, token }: RequestContext,
  id: string,
  payment: PaymentInput,
) {
  if (useMock) return mock.recordCreditPayment(actor, id, payment)
  return apiClient.post(`/credit-accounts/${id}/payments`, payment, { token })
}
