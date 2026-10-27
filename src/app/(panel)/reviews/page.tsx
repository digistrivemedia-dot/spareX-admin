import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getGarageOptions } from "@/features/garages/api"
import { garageReviewsApi } from "@/features/reviews/api"
import { GarageReviewsTable } from "@/features/reviews/components/GarageReviewsTable"
import { ReviewsTabs } from "@/features/reviews/components/ReviewsTabs"
import { GARAGE_REVIEW_FILTERS } from "@/features/reviews/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Reviews" }

export default async function ReviewsPage({ searchParams }: PageProps<"/reviews">) {
  const session = await requirePermission("reviews.view")
  const params = parseListParams(await searchParams, {
    filterKeys: GARAGE_REVIEW_FILTERS,
    defaultSort: { field: "createdAt", direction: "desc" },
  })
  const token = await requireToken()
  const [data, garages] = await Promise.all([
    garageReviewsApi.list(token, params),
    getGarageOptions(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Reviews"
        description="Customers rate garages after a booking. Hide a review that breaks the rules, with a reason."
      />
      <ReviewsTabs active="garages" />
      <GarageReviewsTable
        data={data}
        garageOptions={garages.map(({ id, name }) => ({ value: id, label: name }))}
        canManage={can(session, "reviews.manage")}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
