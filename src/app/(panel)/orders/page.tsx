import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { ordersApi } from "@/features/orders/api"
import { OrdersTable } from "@/features/orders/components/OrdersTable"
import { ORDER_FILTERS } from "@/features/orders/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Orders" }

export default async function OrdersPage({ searchParams }: PageProps<"/orders">) {
  const session = await requirePermission("orders.view")
  const params = parseListParams(await searchParams, {
    filterKeys: ORDER_FILTERS,
    defaultSort: { field: "placedAt", direction: "desc" },
  })
  const data = await ordersApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Orders"
        description="Parts orders from B2C and B2B. You move each order through its statuses; there is no courier integration."
      />
      <OrdersTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
