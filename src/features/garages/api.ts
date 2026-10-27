import "server-only"

import type { GarageDetail, GarageListItem, GaragePayout } from "@/features/garages/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/garages-api"

const useMock = dataSource.garages === "mock"

export const garagesApi = listEndpoint<GarageListItem>(
  dataSource.garages,
  "/garages",
  mock.garageEndpoint,
)
export const payoutsApi = listEndpoint<GaragePayout>(
  dataSource.garages,
  "/garage-payouts",
  mock.payoutEndpoint,
)

export async function getGarage(token: string, id: string): Promise<GarageDetail | null> {
  return useMock ? mock.getGarage(id) : apiClient.get(`/garages/${id}`, { token })
}

export async function getGarageCities(token: string): Promise<string[]> {
  return useMock ? mock.garageCities() : apiClient.get("/garages/cities", { token })
}

export async function getGarageOptions(token: string): Promise<{ id: string; name: string }[]> {
  return useMock ? mock.garageOptions() : apiClient.get("/garages/options", { token })
}

export async function setGarageLive(
  { actor, token }: RequestContext,
  id: string,
  live: boolean,
  reason: string | null,
) {
  if (useMock) return mock.setGarageLive(actor, id, live, reason)
  return apiClient.patch(`/garages/${id}/live`, { live, reason }, { token })
}

export async function settlePayout(
  { actor, token }: RequestContext,
  garageId: string,
  reference: string,
) {
  if (useMock) return mock.settlePayout(actor, garageId, reference)
  return apiClient.post(`/garage-payouts/${garageId}/settle`, { reference }, { token })
}
