import "server-only"

import type { DashboardSummary } from "@/features/dashboard/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import { DASHBOARD_PERIOD_DAYS } from "@/lib/constants"
import * as mock from "@/mocks/dashboard"

export async function getDashboardSummary(token: string): Promise<DashboardSummary> {
  if (dataSource.dashboard === "mock") return mock.getDashboardSummary(DASHBOARD_PERIOD_DAYS)
  return apiClient.get("/dashboard", { token, query: { days: DASHBOARD_PERIOD_DAYS } })
}
