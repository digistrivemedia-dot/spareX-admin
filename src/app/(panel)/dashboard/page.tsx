import { BarChart3 } from "lucide-react"
import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { ChartCard } from "@/components/ui/ChartCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getDashboardSummary } from "@/features/dashboard/api"
import { KpiGrid } from "@/features/dashboard/components/KpiGrid"
import { NeedsAttention } from "@/features/dashboard/components/NeedsAttention"
import { OrdersByStatusChart } from "@/features/dashboard/components/OrdersByStatusChart"
import { SalesChart } from "@/features/dashboard/components/SalesChart"
import { TopCategoriesChart } from "@/features/dashboard/components/TopCategoriesChart"

export const metadata: Metadata = { title: "Dashboard" }

const noSales = <EmptyState icon={BarChart3} title="No sales in this period" className="py-16" />

export default async function DashboardPage() {
  const session = await requirePermission("dashboard.view")
  const summary = await getDashboardSummary(await requireToken())
  const period = `Last ${summary.periodDays} days`
  const hasSales = summary.salesByDay.some((day) => day.b2c + day.b2b > 0)
  const hasOrders = summary.ordersByStatus.some((row) => row.count > 0)

  return (
    <Container>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session.user.name.split(" ")[0]}. Activity figures cover the last ${summary.periodDays} days.`}
      />
      <NeedsAttention attention={summary.attention} session={session} />
      <KpiGrid kpis={summary.kpis} periodDays={summary.periodDays} />
      <ChartCard title="Sales" description={`${period}, B2C and B2B, incl. GST`}>
        {hasSales ? <SalesChart data={summary.salesByDay} /> : noSales}
      </ChartCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Orders by status" description={period}>
          {hasOrders ? (
            <OrdersByStatusChart data={summary.ordersByStatus} />
          ) : (
            <EmptyState icon={BarChart3} title="No orders in this period" className="py-16" />
          )}
        </ChartCard>
        <ChartCard title="Top categories" description={`${period}, by revenue incl. GST`}>
          {summary.topCategories.length > 0 ? (
            <TopCategoriesChart data={summary.topCategories} />
          ) : (
            noSales
          )}
        </ChartCard>
      </div>
    </Container>
  )
}
