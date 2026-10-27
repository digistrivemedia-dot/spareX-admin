import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { bannersApi } from "@/features/content/api"
import { BannerDialog } from "@/features/content/components/BannerDialog"
import { BannersTable } from "@/features/content/components/BannersTable"
import { BANNER_FILTERS } from "@/features/content/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Banners" }

export default async function BannersPage({ searchParams }: PageProps<"/content/banners">) {
  const session = await requirePermission("content.view")
  const params = parseListParams(await searchParams, {
    filterKeys: BANNER_FILTERS,
    defaultSort: { field: "placement", direction: "asc" },
  })
  const data = await bannersApi.list(await requireToken(), params)
  const canManage = can(session, "content.manage")

  return (
    <Container>
      <PageHeader
        title="Banners"
        description="Hero, promo, offer and announcement banners on the B2C and B2B sites, with a web and a mobile image."
        actions={
          canManage && (
            <BannerDialog
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add banner
                </Button>
              }
            />
          )
        }
      />
      <BannersTable data={data} canManage={canManage} canExport={can(session, "data.export")} />
    </Container>
  )
}
