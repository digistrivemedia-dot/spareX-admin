import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { partBrandsApi } from "@/features/masters/api"
import { PartBrandDialog } from "@/features/masters/components/PartBrandDialog"
import { PartBrandsTable } from "@/features/masters/components/PartBrandsTable"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Part brands" }

export default async function PartBrandsPage({ searchParams }: PageProps<"/masters/part-brands">) {
  const session = await requirePermission("masters.view")
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.partBrands,
    defaultSort: { field: "name", direction: "asc" },
  })
  const data = await partBrandsApi.list(await requireToken(), params)
  const canManage = can(session, "masters.manage")

  return (
    <>
      <SectionHeader
        title="Part brands"
        description="Manufacturers of the parts Kannali sells, aftermarket and genuine (OEM)."
        actions={
          canManage && (
            <PartBrandDialog
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add part brand
                </Button>
              }
            />
          )
        }
      />
      <PartBrandsTable data={data} canManage={canManage} canExport={can(session, "data.export")} />
    </>
  )
}
