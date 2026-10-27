import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { applicationsApi } from "@/features/businesses/api"
import { ApplicationsTable } from "@/features/businesses/components/ApplicationsTable"
import { APPLICATION_FILTERS } from "@/features/businesses/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Applications" }

export default async function ApplicationsPage({ searchParams }: PageProps<"/applications">) {
  const session = await requirePermission("businesses.view")
  // Oldest first: the business that has waited longest is reviewed next.
  const params = parseListParams(await searchParams, {
    filterKeys: APPLICATION_FILTERS,
    defaultSort: { field: "submittedAt", direction: "asc" },
  })
  const data = await applicationsApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Applications"
        description="Businesses asking to buy on SpareX B2B. Every business is verified before it can order."
      />
      <ApplicationsTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
