import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { bookingsApi } from "@/features/bookings/api"
import { BookingsTable } from "@/features/bookings/components/BookingsTable"
import { BOOKING_FILTERS } from "@/features/bookings/utils"
import { getGarageOptions } from "@/features/garages/api"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Bookings" }

export default async function BookingsPage({ searchParams }: PageProps<"/bookings">) {
  const session = await requirePermission("bookings.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: BOOKING_FILTERS,
    defaultSort: { field: "date", direction: "desc" },
  })
  const [data, garages] = await Promise.all([
    bookingsApi.list(token, params),
    getGarageOptions(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Bookings"
        description="Service bookings made on B2C. Garages accept or decline them; you can view them and cancel one if needed."
      />
      <BookingsTable
        data={data}
        garageOptions={garages.map((garage) => ({ value: garage.id, label: garage.name }))}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
