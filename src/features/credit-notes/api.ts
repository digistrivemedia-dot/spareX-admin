import "server-only"

import type { CreditNote } from "@/features/credit-notes/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import * as mock from "@/mocks/credit-notes-api"

const useMock = dataSource.creditNotes === "mock"

/** Credit notes are issued by returns (and order adjustments) on the server; admin only reads them. */
export const creditNotesApi = listEndpoint<CreditNote>(
  dataSource.creditNotes,
  "/credit-notes",
  mock.creditNoteEndpoint,
)

export async function getCreditNote(token: string, id: string): Promise<CreditNote | null> {
  return useMock ? mock.getCreditNote(id) : apiClient.get(`/credit-notes/${id}`, { token })
}
