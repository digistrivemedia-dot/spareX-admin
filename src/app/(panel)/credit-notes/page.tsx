import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { creditNotesApi } from "@/features/credit-notes/api"
import { CreditNotesTable } from "@/features/credit-notes/components/CreditNotesTable"
import { CREDIT_NOTE_FILTERS } from "@/features/credit-notes/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Credit notes" }

export default async function CreditNotesPage({ searchParams }: PageProps<"/credit-notes">) {
  const session = await requirePermission("creditNotes.view")
  const params = parseListParams(await searchParams, {
    filterKeys: CREDIT_NOTE_FILTERS,
    defaultSort: { field: "issuedAt", direction: "desc" },
  })
  const data = await creditNotesApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Credit notes"
        description="Document B2C refunds and reduce what B2B credit customers owe. Issued from returns."
      />
      <CreditNotesTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
