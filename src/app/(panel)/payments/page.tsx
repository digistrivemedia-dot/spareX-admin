import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { paymentsApi } from "@/features/orders/api"
import { PaymentsTable } from "@/features/orders/components/PaymentsTable"
import { PAYMENT_FILTERS } from "@/features/orders/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Payments and refunds" }

export default async function PaymentsPage({ searchParams }: PageProps<"/payments">) {
  const session = await requirePermission("payments.view")
  const params = parseListParams(await searchParams, {
    filterKeys: PAYMENT_FILTERS,
    // Offline payments waiting for admin come first, then failed ones.
    defaultSort: { field: "attention", direction: "asc" },
  })
  const data = await paymentsApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Payments and refunds"
        description="Razorpay payments are marked paid automatically. Bank transfer, cash and collected COD are marked paid here, with a reference."
      />
      <PaymentsTable
        data={data}
        canConfirm={can(session, "payments.manage")}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
