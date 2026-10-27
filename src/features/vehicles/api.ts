import "server-only"

import type { VehicleDetail, VehicleListItem } from "@/features/vehicles/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { IsoDate, RequestContext } from "@/lib/types"
import * as mock from "@/mocks/customers-api"

const useMock = dataSource.vehicles === "mock"

export const vehiclesApi = listEndpoint<VehicleListItem>(
  dataSource.vehicles,
  "/vehicles",
  mock.vehicleEndpoint,
)

export async function getVehicle(token: string, id: string): Promise<VehicleDetail | null> {
  return useMock ? mock.getVehicle(id) : apiClient.get(`/vehicles/${id}`, { token })
}

export async function transferVehicle(
  context: RequestContext,
  id: string,
  customerId: string,
  date: IsoDate,
) {
  if (useMock) return mock.transferVehicle(context.actor, id, customerId, date)
  return apiClient.post(`/vehicles/${id}/transfer`, { customerId, date }, { token: context.token })
}
