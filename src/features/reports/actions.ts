"use server"

import { getReport } from "@/features/reports/api"
import type { ReportKind } from "@/features/reports/types"
import { parseReportQuery, REPORT_TABS } from "@/features/reports/utils"
import { exportCsv } from "@/lib/csv-export"

type CsvRow = Record<string, string>

/** Money is exported in rupees and percentages as plain numbers, so spreadsheets can add them up. */
const csvValue = (value: number, format: string) =>
  format === "money" ? (value / 100).toFixed(2) : String(value)

export async function exportReportAction(kind: ReportKind, query: string) {
  const reportQuery = parseReportQuery(kind, new URLSearchParams(query))
  const label = REPORT_TABS.find((tab) => tab.id === kind)?.label ?? "Report"
  return exportCsv<CsvRow>({
    entity: "report",
    label: `${label} report`,
    load: async (token) => {
      const { table } = await getReport(token, kind, reportQuery)
      return table.rows.map((row) => ({
        Name: row.name,
        Detail: row.detail ?? "",
        ...Object.fromEntries(
          table.columns.map((column) => [
            column.format === "money" ? `${column.label} (₹)` : column.label,
            csvValue(row.values[column.key] ?? 0, column.format),
          ]),
        ),
      }))
    },
    columns: (rows) =>
      Object.keys(rows[0] ?? { Name: "" }).map((header) => ({
        header,
        value: (row) => row[header] ?? "",
      })),
  })
}
