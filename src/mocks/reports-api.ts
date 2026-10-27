import "server-only"

import type { Report, ReportKind, ReportQuery } from "@/features/reports/types"
import { customerReport } from "@/mocks/reports/customers"
import { salesReport } from "@/mocks/reports/sales"
import { serviceReport } from "@/mocks/reports/service"
import { vehicleReport } from "@/mocks/reports/vehicles"
import { delay } from "@/mocks/utils"

const BUILDERS: Record<ReportKind, (query: ReportQuery) => Report> = {
  sales: salesReport,
  service: serviceReport,
  customers: customerReport,
  vehicles: vehicleReport,
}

/** Computed from the demo data the way the backend's report endpoints will. */
export async function getReport(kind: ReportKind, query: ReportQuery): Promise<Report> {
  await delay()
  return BUILDERS[kind](query)
}
