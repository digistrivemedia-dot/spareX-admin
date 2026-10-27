import "server-only"

import type { Booking } from "@/features/bookings/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/service-api"

const useMock = dataSource.bookings === "mock"

export const bookingsApi = listEndpoint<Booking>(
  dataSource.bookings,
  "/bookings",
  mock.bookingEndpoint,
)

export async function getBooking(token: string, id: string): Promise<Booking | null> {
  return useMock ? mock.getBooking(id) : apiClient.get(`/bookings/${id}`, { token })
}

export async function cancelBooking({ actor, token }: RequestContext, id: string, reason: string) {
  if (useMock) return mock.cancelBooking(actor, id, reason)
  return apiClient.post(`/bookings/${id}/cancel`, { reason }, { token })
}
