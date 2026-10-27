import "server-only"

import type { BannerInput, FaqInput, PageInput } from "@/features/content/schemas"
import type {
  Banner,
  ContentPage,
  Faq,
  FeaturedContent,
  FeaturedKind,
} from "@/features/content/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/content-api"

const source = dataSource.content
const useMock = source === "mock"

export const bannersApi = listEndpoint<Banner>(source, "/content/banners", mock.bannerEndpoint)
export const pagesApi = listEndpoint<ContentPage>(source, "/content/pages", mock.pageEndpoint)
export const faqsApi = listEndpoint<Faq>(source, "/content/faqs", mock.faqEndpoint)

export async function saveBanner(
  { actor, token }: RequestContext,
  id: string | null,
  input: BannerInput,
) {
  if (useMock) return mock.saveBanner(actor, id, input)
  return id
    ? apiClient.patch(`/content/banners/${id}`, input, { token })
    : apiClient.post("/content/banners", input, { token })
}

export async function deleteBanner({ actor, token }: RequestContext, id: string) {
  if (useMock) return mock.deleteBanner(actor, id)
  return apiClient.delete(`/content/banners/${id}`, { token })
}

export async function getFeatured(token: string): Promise<FeaturedContent> {
  return useMock ? mock.getFeatured() : apiClient.get("/content/featured", { token })
}

export async function saveFeatured(
  { actor, token }: RequestContext,
  kind: FeaturedKind,
  ids: string[],
) {
  if (useMock) return mock.saveFeatured(actor, kind, ids)
  return apiClient.patch(`/content/featured/${kind}`, { ids }, { token })
}

export async function getPage(token: string, id: string): Promise<ContentPage | null> {
  return useMock ? mock.getPage(id) : apiClient.get(`/content/pages/${id}`, { token })
}

export async function savePage({ actor, token }: RequestContext, id: string, input: PageInput) {
  if (useMock) return mock.savePage(actor, id, input)
  return apiClient.patch(`/content/pages/${id}`, input, { token })
}

export async function saveFaq(
  { actor, token }: RequestContext,
  id: string | null,
  input: FaqInput,
) {
  if (useMock) return mock.saveFaq(actor, id, input)
  return id
    ? apiClient.patch(`/content/faqs/${id}`, input, { token })
    : apiClient.post("/content/faqs", input, { token })
}

export async function deleteFaq({ actor, token }: RequestContext, id: string) {
  if (useMock) return mock.deleteFaq(actor, id)
  return apiClient.delete(`/content/faqs/${id}`, { token })
}
