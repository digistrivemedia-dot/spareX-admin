import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { enquiriesApi } from "@/features/enquiries/api"
import { EnquiriesTable } from "@/features/enquiries/components/EnquiriesTable"
import { ENQUIRY_FILTERS } from "@/features/enquiries/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Enquiries" }

export default async function EnquiriesPage({ searchParams }: PageProps<"/enquiries">) {
  const session = await requirePermission("enquiries.view")
  // Open enquiries first, so new ones are handled before anything else.
  const params = parseListParams(await searchParams, {
    filterKeys: ENQUIRY_FILTERS,
    defaultSort: { field: "status", direction: "asc" },
  })
  const data = await enquiriesApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Enquiries"
        description="Requests from B2C when a customer's vehicle isn't listed or no part fits it."
      />
      <EnquiriesTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
