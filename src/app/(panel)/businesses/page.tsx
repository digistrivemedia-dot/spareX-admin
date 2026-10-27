import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { businessesApi } from "@/features/businesses/api"
import { BusinessesTable } from "@/features/businesses/components/BusinessesTable"
import { BUSINESS_FILTERS } from "@/features/businesses/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Businesses" }

export default async function BusinessesPage({ searchParams }: PageProps<"/businesses">) {
  const session = await requirePermission("businesses.view")
  const params = parseListParams(await searchParams, {
    filterKeys: BUSINESS_FILTERS,
    defaultSort: { field: "name", direction: "asc" },
  })
  const data = await businessesApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Businesses"
        description="Verified B2B buyers: garages, fleets, dealers, retailers, resellers and corporates."
      />
      <BusinessesTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
