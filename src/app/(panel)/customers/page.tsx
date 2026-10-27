import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { customersApi, getCustomerCities } from "@/features/customers/api"
import { CustomersTable } from "@/features/customers/components/CustomersTable"
import { CUSTOMER_FILTERS } from "@/features/customers/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Customers" }

export default async function CustomersPage({ searchParams }: PageProps<"/customers">) {
  const session = await requirePermission("customers.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: CUSTOMER_FILTERS,
    defaultSort: { field: "createdAt", direction: "desc" },
  })
  const [data, cities] = await Promise.all([
    customersApi.list(token, params),
    getCustomerCities(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Customers"
        description="People who shop and book services on the B2C site."
      />
      <CustomersTable data={data} cities={cities} canExport={can(session, "data.export")} />
    </Container>
  )
}
