import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { garagesApi, getGarageCities } from "@/features/garages/api"
import { GaragesTable } from "@/features/garages/components/GaragesTable"
import { GARAGE_FILTERS } from "@/features/garages/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Garages" }

export default async function GaragesPage({ searchParams }: PageProps<"/garages">) {
  const session = await requirePermission("garages.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: GARAGE_FILTERS,
    defaultSort: { field: "name", direction: "asc" },
  })
  const [data, cities] = await Promise.all([garagesApi.list(token, params), getGarageCities(token)])

  return (
    <Container>
      <PageHeader
        title="Garages"
        description="Kannali-owned and partner garages. Only live garages can be booked on B2C."
      />
      <GaragesTable data={data} cities={cities} canExport={can(session, "data.export")} />
    </Container>
  )
}
