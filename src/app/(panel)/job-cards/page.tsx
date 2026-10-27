import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getGarageOptions } from "@/features/garages/api"
import { jobCardsApi } from "@/features/job-cards/api"
import { JobCardsTable } from "@/features/job-cards/components/JobCardsTable"
import { JOB_CARD_FILTERS } from "@/features/job-cards/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Job cards" }

export default async function JobCardsPage({ searchParams }: PageProps<"/job-cards">) {
  const session = await requirePermission("jobCards.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: JOB_CARD_FILTERS,
    defaultSort: { field: "createdAt", direction: "desc" },
  })
  const [data, garages] = await Promise.all([
    jobCardsApi.list(token, params),
    getGarageOptions(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Job cards"
        description="Work in every garage, from check-in to delivery. Garages run job cards on B2B; this view is read only."
      />
      <JobCardsTable
        data={data}
        garageOptions={garages.map((garage) => ({ value: garage.id, label: garage.name }))}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
