import "server-only"

import type { AuditEntry, AuditInput } from "@/features/audit/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import { listParamsToQuery } from "@/lib/list-params"
import type { ActorRef, ListParams, Paginated } from "@/lib/types"
import * as mock from "@/mocks/audit"

const useMock = dataSource.audit === "mock"

export async function listAuditEntries(
  token: string,
  params: ListParams,
): Promise<Paginated<AuditEntry>> {
  if (useMock) return mock.listAuditEntries(params)
  return apiClient.get("/audit-log", { token, query: listParamsToQuery(params) })
}

/** Every matching entry, unpaginated, for CSV export. */
export async function listAllAuditEntries(
  token: string,
  params: ListParams,
): Promise<AuditEntry[]> {
  if (useMock) return mock.listAllAuditEntries(params)
  return apiClient.get("/audit-log/all", { token, query: listParamsToQuery(params) })
}

/**
 * Records an action the backend cannot see by itself, such as a CSV export built in the panel. Changes made
 * through feature APIs are recorded by the backend (or by the mock mutation) and must not call this.
 */
export async function recordAudit(
  token: string,
  actor: ActorRef,
  input: AuditInput,
): Promise<void> {
  if (useMock) {
    mock.recordAuditEntry(actor, input)
    return
  }
  await apiClient.post("/audit-log", input, { token })
}
