import "server-only"

import type { Order, OrderStatus, PaymentRow, Shipment } from "@/features/orders/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { IsoDate, RequestContext } from "@/lib/types"
import * as mock from "@/mocks/orders-api"

const useMock = dataSource.orders === "mock"

export const ordersApi = listEndpoint<Order>(dataSource.orders, "/orders", mock.orderEndpoint)
export const paymentsApi = listEndpoint<PaymentRow>(
  dataSource.orders,
  "/payments",
  mock.paymentEndpoint,
)

export async function getOrder(token: string, id: string): Promise<Order | null> {
  return useMock ? mock.getOrder(id) : apiClient.get(`/orders/${id}`, { token })
}

export async function advanceOrder(
  { actor, token }: RequestContext,
  id: string,
  next: OrderStatus,
  shipment: Omit<Shipment, "shippedAt"> | null,
) {
  if (useMock) return mock.advanceOrder(actor, id, next, shipment)
  return apiClient.post(`/orders/${id}/status`, { status: next, shipment }, { token })
}

export async function markOrderPaid(
  { actor, token }: RequestContext,
  id: string,
  reference: string,
  date: IsoDate,
) {
  if (useMock) return mock.markOrderPaid(actor, id, reference, date)
  return apiClient.post(`/orders/${id}/payment`, { reference, date }, { token })
}

export async function cancelOrder({ actor, token }: RequestContext, id: string, reason: string) {
  if (useMock) return mock.cancelOrder(actor, id, reason)
  return apiClient.post(`/orders/${id}/cancel`, { reason }, { token })
}
