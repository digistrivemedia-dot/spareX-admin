import "server-only"

import type { ApproveInput } from "@/features/businesses/schemas"
import type {
  Business,
  BusinessApplication,
  BusinessDetail,
  BusinessListItem,
} from "@/features/businesses/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/businesses-api"

const useMock = dataSource.businesses === "mock"

export const applicationsApi = listEndpoint<BusinessApplication>(
  dataSource.businesses,
  "/business-applications",
  mock.applicationEndpoint,
)

export const businessesApi = listEndpoint<BusinessListItem>(
  dataSource.businesses,
  "/businesses",
  mock.businessEndpoint,
)

export async function getBusinessOptions(token: string): Promise<{ id: string; name: string }[]> {
  return useMock ? mock.businessOptions() : apiClient.get("/businesses/options", { token })
}

export async function getApplication(
  token: string,
  id: string,
): Promise<BusinessApplication | null> {
  return useMock
    ? mock.getApplication(id)
    : apiClient.get(`/business-applications/${id}`, { token })
}

export async function startReview({ actor, token }: RequestContext, id: string) {
  if (useMock) return mock.startReview(actor, id)
  return apiClient.post(`/business-applications/${id}/review`, undefined, { token })
}

export async function approveApplication(
  { actor, token }: RequestContext,
  id: string,
  input: ApproveInput,
): Promise<Business> {
  if (useMock) return mock.approveApplication(actor, id, input)
  return apiClient.post(`/business-applications/${id}/approve`, input, { token })
}

export async function sendBackApplication(
  { actor, token }: RequestContext,
  id: string,
  fields: string[],
  note: string,
) {
  if (useMock) return mock.sendBackApplication(actor, id, fields, note)
  return apiClient.post(`/business-applications/${id}/send-back`, { fields, note }, { token })
}

export async function rejectApplication(
  { actor, token }: RequestContext,
  id: string,
  reason: string,
) {
  if (useMock) return mock.rejectApplication(actor, id, reason)
  return apiClient.post(`/business-applications/${id}/reject`, { reason }, { token })
}

export async function getBusiness(token: string, id: string): Promise<BusinessDetail | null> {
  return useMock ? mock.getBusiness(id) : apiClient.get(`/businesses/${id}`, { token })
}

export async function setBusinessHold(
  { actor, token }: RequestContext,
  id: string,
  hold: boolean,
  reason: string | null,
) {
  if (useMock) return mock.setBusinessHold(actor, id, hold, reason)
  return apiClient.patch(`/businesses/${id}/hold`, { hold, reason }, { token })
}
