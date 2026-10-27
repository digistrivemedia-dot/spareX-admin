import "server-only"

import type { QuotationInput } from "@/features/quotations/schemas"
import type { Quotation } from "@/features/quotations/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/quotations-api"

const useMock = dataSource.quotations === "mock"

export const quotationsApi = listEndpoint<Quotation>(
  dataSource.quotations,
  "/quotations",
  mock.quotationEndpoint,
)

export async function getQuotation(token: string, id: string): Promise<Quotation | null> {
  return useMock ? mock.getQuotation(id) : apiClient.get(`/quotations/${id}`, { token })
}

export async function sendQuotation(
  { actor, token }: RequestContext,
  id: string,
  input: QuotationInput,
) {
  if (useMock) return mock.sendQuotation(actor, id, input)
  return apiClient.post(`/quotations/${id}/send`, input, { token })
}
