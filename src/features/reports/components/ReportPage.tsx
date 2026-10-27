import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { TabNav } from "@/components/layout/TabNav"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getReport } from "@/features/reports/api"
import { ReportView } from "@/features/reports/components/ReportView"
import type { ReportKind } from "@/features/reports/types"
import { parseReportQuery, REPORT_TABS, toSearchParams } from "@/features/reports/utils"

type ReportPageProps = {
  kind: ReportKind
  searchParams: Record<string, string | string[] | undefined>
}

/** The shell every report route renders: header, report tabs, then the report. */
export async function ReportPage({ kind, searchParams }: ReportPageProps) {
  const session = await requirePermission("reports.view")
  const query = parseReportQuery(kind, toSearchParams(searchParams))
  const report = await getReport(await requireToken(), kind, query)
  const tab = REPORT_TABS.find((item) => item.id === kind)

  return (
    <Container>
      <PageHeader title="Reports" description={tab?.description} />
      <TabNav
        label="Reports"
        activeTab={kind}
        tabs={REPORT_TABS.map(({ id, label }) => ({ id, label, href: `/reports/${id}` }))}
      />
      <ReportView
        kind={kind}
        query={query}
        report={report}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
