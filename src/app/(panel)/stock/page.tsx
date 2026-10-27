import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { listStock } from "@/features/catalog/api"
import { StockTable } from "@/features/catalog/components/StockTable"
import { CATALOG_FILTERS } from "@/features/catalog/utils"
import { getTopLevelCategories } from "@/features/masters/api"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Stock" }

export default async function StockPage({ searchParams }: PageProps<"/stock">) {
  const session = await requirePermission("stock.view")
  const token = await requireToken()
  // Lowest stock first, so out-of-stock and low-stock parts are at the top.
  const params = parseListParams(await searchParams, {
    filterKeys: CATALOG_FILTERS.stock,
    defaultSort: { field: "stock", direction: "asc" },
  })
  const [data, categories] = await Promise.all([
    listStock(token, params),
    getTopLevelCategories(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Stock"
        description="One Kannali stock quantity per product. Every change needs a reason and is kept in the history."
      />
      <StockTable
        data={data}
        categoryOptions={categories.map((category) => ({
          value: category.id,
          label: category.name,
        }))}
        canManage={can(session, "stock.manage")}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
