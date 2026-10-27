import "server-only"

import type { Report, ReportKind, ReportQuery } from "@/features/reports/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import * as mock from "@/mocks/reports-api"

export async function getReport(
  token: string,
  kind: ReportKind,
  query: ReportQuery,
): Promise<Report> {
  if (dataSource.reports === "mock") return mock.getReport(kind, query)
  const { channel, ...rest } = query
  return apiClient.get(`/reports/${kind}`, {
    token,
    query: { ...rest, ...(channel ? { channel } : {}) },
  })
}
