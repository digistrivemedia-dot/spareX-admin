import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { FormAlert } from "@/components/ui/FormAlert"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { payoutsApi } from "@/features/garages/api"
import { PayoutsTable } from "@/features/garages/components/PayoutsTable"
import { PAYOUT_FILTERS } from "@/features/garages/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Garage payouts" }

/** Hidden from the menu (`garagePayouts` switch) until Q-09 is answered; the screen works if opened. */
export default async function GaragePayoutsPage({ searchParams }: PageProps<"/garages/payouts">) {
  const session = await requirePermission("payouts.view")
  const params = parseListParams(await searchParams, {
    filterKeys: PAYOUT_FILTERS,
    defaultSort: { field: "unsettledAmount", direction: "desc" },
  })
  const data = await payoutsApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Garage payouts"
        description="Online service payments Kannali collected for partner garages, and what is still due to them."
      />
      <FormAlert tone="warning">
        Built on the default for Q-09: customers pay Kannali online and Kannali settles with each
        partner garage, with no platform fee. Hidden from the menu until the client confirms.
      </FormAlert>
      <PayoutsTable
        data={data}
        canManage={can(session, "payouts.manage")}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
