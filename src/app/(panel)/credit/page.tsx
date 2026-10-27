import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { creditApi } from "@/features/credit/api"
import { CreditTable } from "@/features/credit/components/CreditTable"
import { CREDIT_FILTERS } from "@/features/credit/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Credit accounts" }

export default async function CreditPage({ searchParams }: PageProps<"/credit">) {
  const session = await requirePermission("credit.view")
  // Overdue and on-hold accounts first.
  const params = parseListParams(await searchParams, {
    filterKeys: CREDIT_FILTERS,
    defaultSort: { field: "attention", direction: "asc" },
  })
  const data = await creditApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Credit accounts"
        description="B2B businesses allowed to order on credit. Amounts include GST."
      />
      <CreditTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
