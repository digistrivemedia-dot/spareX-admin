import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getBusinessOptions } from "@/features/businesses/api"
import { quotationsApi } from "@/features/quotations/api"
import { QuotationsTable } from "@/features/quotations/components/QuotationsTable"
import { QUOTATION_FILTERS } from "@/features/quotations/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Quotations" }

export default async function QuotationsPage({ searchParams }: PageProps<"/quotations">) {
  const session = await requirePermission("quotations.view")
  const params = parseListParams(await searchParams, {
    filterKeys: QUOTATION_FILTERS,
    defaultSort: { field: "createdAt", direction: "desc" },
  })
  const token = await requireToken()
  const [data, businesses] = await Promise.all([
    quotationsApi.list(token, params),
    getBusinessOptions(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Quotations"
        description="B2B quotation requests, auto-priced from each business's discount. Edit, then send with a validity."
      />
      <QuotationsTable
        data={data}
        businessOptions={businesses.map(({ id, name }) => ({ value: id, label: name }))}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
