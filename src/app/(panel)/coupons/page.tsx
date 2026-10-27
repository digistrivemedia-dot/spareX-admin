import { Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { FormAlert } from "@/components/ui/FormAlert"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { couponsApi } from "@/features/coupons/api"
import { CouponsTable } from "@/features/coupons/components/CouponsTable"
import { COUPON_FILTERS } from "@/features/coupons/utils"
import { isEnabled } from "@/lib/features"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Coupons and offers" }

/** Built either way; the `coupons` switch only hides the menu item and the B2C coupon box (Q-06). */
export default async function CouponsPage({ searchParams }: PageProps<"/coupons">) {
  const session = await requirePermission("coupons.view")
  const params = parseListParams(await searchParams, {
    filterKeys: COUPON_FILTERS,
    defaultSort: { field: "startsAt", direction: "desc" },
  })
  const data = await couponsApi.list(await requireToken(), params)

  return (
    <Container>
      <PageHeader
        title="Coupons and offers"
        description="Percentage and flat offers on orders, brands, categories, B2B and service bookings."
        actions={
          can(session, "coupons.manage") && (
            <Button asChild>
              <Link href="/coupons/new">
                <Plus aria-hidden />
                Create coupon
              </Link>
            </Button>
          )
        }
      />
      {!isEnabled("coupons") && (
        <FormAlert tone="warning">
          Coupons are switched off: customers don&apos;t see them until the client confirms (Q-06).
        </FormAlert>
      )}
      <CouponsTable data={data} canExport={can(session, "data.export")} />
    </Container>
  )
}
