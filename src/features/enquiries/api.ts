import "server-only"

import type { Enquiry, EnquiryStatus } from "@/features/enquiries/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/enquiries-api"

const useMock = dataSource.enquiries === "mock"

export const enquiriesApi = listEndpoint<Enquiry>(
  dataSource.enquiries,
  "/enquiries",
  mock.enquiryEndpoint,
)

export async function getEnquiry(token: string, id: string): Promise<Enquiry | null> {
  return useMock ? mock.getEnquiry(id) : apiClient.get(`/enquiries/${id}`, { token })
}

export async function addEnquiryNote(context: RequestContext, id: string, text: string) {
  if (useMock) return mock.addEnquiryNote(context.actor, id, text)
  return apiClient.post(`/enquiries/${id}/notes`, { text }, { token: context.token })
}

export async function replyToEnquiry(
  context: RequestContext,
  id: string,
  text: string,
  resolve: boolean,
) {
  if (useMock) return mock.replyToEnquiry(context.actor, id, text, resolve)
  return apiClient.post(`/enquiries/${id}/reply`, { text, resolve }, { token: context.token })
}

export async function setEnquiryStatus(context: RequestContext, id: string, status: EnquiryStatus) {
  if (useMock) return mock.setEnquiryStatus(context.actor, id, status)
  return apiClient.patch(`/enquiries/${id}`, { status }, { token: context.token })
}
