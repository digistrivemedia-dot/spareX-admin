import "server-only"

import type { PickupInput, VerifyInput } from "@/features/returns/schemas"
import type { ReturnRequest } from "@/features/returns/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/returns-api"

const useMock = dataSource.returns === "mock"

export const returnsApi = listEndpoint<ReturnRequest>(
  dataSource.returns,
  "/returns",
  mock.returnEndpoint,
)

export async function getReturn(token: string, id: string): Promise<ReturnRequest | null> {
  return useMock ? mock.getReturn(id) : apiClient.get(`/returns/${id}`, { token })
}

export async function approveReturn({ actor, token }: RequestContext, id: string) {
  if (useMock) return mock.approveReturn(actor, id)
  return apiClient.post(`/returns/${id}/approve`, {}, { token })
}

export async function rejectReturn({ actor, token }: RequestContext, id: string, reason: string) {
  if (useMock) return mock.rejectReturn(actor, id, reason)
  return apiClient.post(`/returns/${id}/reject`, { reason }, { token })
}

export async function schedulePickup(
  { actor, token }: RequestContext,
  id: string,
  pickup: PickupInput,
) {
  if (useMock) return mock.schedulePickup(actor, id, pickup)
  return apiClient.post(`/returns/${id}/pickup`, pickup, { token })
}

export async function verifyReturn(
  { actor, token }: RequestContext,
  id: string,
  input: VerifyInput,
) {
  if (useMock) return mock.verifyReturn(actor, id, input)
  return apiClient.post(`/returns/${id}/verify`, input, { token })
}

/** The server decides refund, credit note or replacement from the request and the order's payment. */
export async function resolveReturn({ actor, token }: RequestContext, id: string) {
  if (useMock) return mock.resolveReturn(actor, id)
  return apiClient.post(`/returns/${id}/resolve`, {}, { token })
}

export async function closeReturn({ actor, token }: RequestContext, id: string) {
  if (useMock) return mock.closeReturn(actor, id)
  return apiClient.post(`/returns/${id}/close`, {}, { token })
}
