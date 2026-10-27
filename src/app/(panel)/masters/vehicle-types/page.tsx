import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { vehicleTypesApi } from "@/features/masters/api"
import { VehicleTypesTable } from "@/features/masters/components/VehicleTypesTable"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Vehicle types" }

export default async function VehicleTypesPage({
  searchParams,
}: PageProps<"/masters/vehicle-types">) {
  const session = await requirePermission("masters.view")
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.vehicleTypes,
    defaultSort: { field: "sortOrder", direction: "asc" },
  })
  const data = await vehicleTypesApi.list(await requireToken(), params)

  return (
    <>
      <SectionHeader
        title="Vehicle types"
        description="The top level of the vehicle master. Electric is a fuel, not a type, so it is set on each variant."
      />
      <VehicleTypesTable
        data={data}
        canManage={can(session, "masters.manage")}
        canExport={can(session, "data.export")}
      />
    </>
  )
}
