import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { returnsApi } from "@/features/returns/api"
import { ReturnsTable } from "@/features/returns/components/ReturnsTable"
import { RETURN_FILTERS } from "@/features/returns/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Returns and replacements" }

export default async function ReturnsPage({ searchParams }: PageProps<"/returns">) {
  const session = await requirePermission("returns.view")
  const params = parseListParams(await searchParams, {
    filterKeys: RETURN_FILTERS,
    // New requests to approve first, then verified ones to settle.
    defaultSort: { field: "attention", direction: "asc" },
  })
  const data = await returnsApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Returns and replacements"
        description="Approve or reject, schedule the pickup, verify the item, then refund, issue a credit note or send a replacement."
      />
      <ReturnsTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
