import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { vehicleBrandsApi } from "@/features/masters/api"
import { VehicleBrandDialog } from "@/features/masters/components/VehicleBrandDialog"
import { VehicleBrandsTable } from "@/features/masters/components/VehicleBrandsTable"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Vehicle brands" }

export default async function VehicleBrandsPage({
  searchParams,
}: PageProps<"/masters/vehicle-brands">) {
  const session = await requirePermission("masters.view")
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.vehicleBrands,
    defaultSort: { field: "name", direction: "asc" },
  })
  const data = await vehicleBrandsApi.list(await requireToken(), params)
  const canManage = can(session, "masters.manage")

  return (
    <>
      <SectionHeader
        title="Vehicle brands"
        description="Brands customers pick when adding a vehicle, with the vehicle types each one makes."
        actions={
          canManage && (
            <VehicleBrandDialog
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add brand
                </Button>
              }
            />
          )
        }
      />
      <VehicleBrandsTable
        data={data}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </>
  )
}
