import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/EmptyState"
import type { ReportTable } from "@/features/reports/types"
import { formatReportValue } from "@/features/reports/utils"
import { cn } from "@/lib/utils"

/** A report breakdown. Rows are already totalled and sorted by the server. */
export function ReportTableCard({ table, action }: { table: ReportTable; action?: ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-200 py-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">{table.title}</CardTitle>
          {table.description && <CardDescription>{table.description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="px-0">
        {table.rows.length === 0 ? (
          <EmptyState title="Nothing in this period" description="Try a longer date range." />
        ) : (
          // Narrow screens scroll the table inside its card, never the page.
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-medium sm:px-6">
                    Name
                  </th>
                  {table.columns.map((column) => (
                    <th key={column.key} scope="col" className="px-4 py-2 text-right font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {table.rows.map((row) => (
                  <tr key={row.id} className="h-12 hover:bg-gray-50">
                    <th
                      scope="row"
                      className="px-4 py-2 text-left font-medium text-gray-900 sm:px-6"
                    >
                      {row.name}
                      {row.detail && (
                        <span className="block text-xs font-normal text-gray-500">
                          {row.detail}
                        </span>
                      )}
                    </th>
                    {table.columns.map((column, index) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-2 text-right tabular-nums",
                          index === 0 && "font-semibold text-gray-900",
                        )}
                      >
                        {formatReportValue(row.values[column.key] ?? 0, column.format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
