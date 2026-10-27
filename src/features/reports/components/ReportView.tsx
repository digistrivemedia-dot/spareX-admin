import { BarChart3 } from "lucide-react"

import { ChartCard } from "@/components/ui/ChartCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import { StatCard } from "@/components/ui/StatCard"
import { exportReportAction } from "@/features/reports/actions"
import { ReportChart } from "@/features/reports/components/ReportChart"
import { ReportFilters } from "@/features/reports/components/ReportFilters"
import { ReportTableCard } from "@/features/reports/components/ReportTableCard"
import type { Report, ReportKind, ReportQuery } from "@/features/reports/types"
import { formatReportValue } from "@/features/reports/utils"
import { formatDate } from "@/lib/format"

type ReportViewProps = { kind: ReportKind; query: ReportQuery; report: Report; canExport: boolean }

/** Every report: filters, headline figures, a chart by period and the breakdown table. */
export function ReportView({ kind, query, report, canExport }: ReportViewProps) {
  const period = `${formatDate(query.from)} – ${formatDate(query.to)}, by ${query.group}`
  const hasData = report.series.points.some((point) =>
    Object.values(point.values).some((value) => value > 0),
  )

  return (
    <>
      <ReportFilters kind={kind} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {report.stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={formatReportValue(stat.value, stat.format)}
            hint={stat.hint}
          />
        ))}
      </div>
      <ChartCard title={report.chartTitle} description={period}>
        {hasData ? (
          <ReportChart series={report.series} />
        ) : (
          <EmptyState
            icon={BarChart3}
            title="Nothing in this period"
            description="Try a longer date range."
            className="py-16"
          />
        )}
      </ChartCard>
      <ReportTableCard
        table={report.table}
        action={canExport && <ExportCsvButton action={exportReportAction.bind(null, kind)} />}
      />
      {report.extraTable && <ReportTableCard table={report.extraTable} />}
    </>
  )
}
