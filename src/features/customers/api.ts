import "server-only"

import type { CustomerDetail, CustomerListItem } from "@/features/customers/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/customers-api"

const useMock = dataSource.customers === "mock"

export const customersApi = listEndpoint<CustomerListItem>(
  dataSource.customers,
  "/customers",
  mock.customerEndpoint,
)

export type CustomerOption = { id: string; name: string; phone: string }

export async function getCustomer(token: string, id: string): Promise<CustomerDetail | null> {
  return useMock ? mock.getCustomer(id) : apiClient.get(`/customers/${id}`, { token })
}

export async function getCustomerCities(token: string): Promise<string[]> {
  return useMock ? mock.customerCities() : apiClient.get("/customers/cities", { token })
}

/** Active customers as options, e.g. for transferring a vehicle. */
export async function getCustomerOptions(token: string): Promise<CustomerOption[]> {
  if (!useMock) return apiClient.get("/customers/options", { token })
  const { items } = await mock.customerEndpoint.list({
    page: 1,
    pageSize: 1000,
    filters: { status: "active" },
    sort: { field: "name", direction: "asc" },
  })
  return items.map(({ id, name, phone }) => ({ id, name, phone }))
}

export async function setCustomerActive(
  context: RequestContext,
  id: string,
  active: boolean,
  reason: string | null,
) {
  if (useMock) return mock.setCustomerActive(context.actor, id, active, reason)
  return apiClient.patch(`/customers/${id}/status`, { active, reason }, { token: context.token })
}

export async function deleteCustomer(context: RequestContext, id: string) {
  if (useMock) return mock.deleteCustomer(context.actor, id)
  return apiClient.delete(`/customers/${id}`, { token: context.token })
}
