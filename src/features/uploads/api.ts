import "server-only"

import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/uploads"

/** Uploads an image or document and returns the URL to store on the record. */
export async function uploadFile({ token }: RequestContext, file: File): Promise<string> {
  // Files follow the catalogue's data source; they move to the backend together.
  if (dataSource.catalog === "mock") return mock.uploadFile(file)
  const body = new FormData()
  body.set("file", file)
  const { url } = await apiClient.post<{ url: string }>("/uploads", body, { token })
  return url
}

/** A form's image value as a URL to store: uploads a newly picked file, keeps an existing URL. */
export async function storeImage(
  context: RequestContext,
  value: string | File | null,
): Promise<string | null> {
  if (value instanceof File) return uploadFile(context, value)
  return value || null
}
