import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { SectionHeader } from "@/components/layout/SectionHeader"
import { Button } from "@/components/ui/button"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getVehicleBrandOptions, vehicleModelsApi } from "@/features/masters/api"
import { VehicleModelDialog } from "@/features/masters/components/VehicleModelDialog"
import { VehicleModelsTable } from "@/features/masters/components/VehicleModelsTable"
import { MASTER_FILTERS } from "@/features/masters/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Models and variants" }

export default async function VehicleModelsPage({
  searchParams,
}: PageProps<"/masters/vehicle-models">) {
  const session = await requirePermission("masters.view")
  const token = await requireToken()
  const params = parseListParams(await searchParams, {
    filterKeys: MASTER_FILTERS.vehicleModels,
    defaultSort: { field: "brandName", direction: "asc" },
  })
  const [data, brands] = await Promise.all([
    vehicleModelsApi.list(token, params),
    getVehicleBrandOptions(token),
  ])
  const brandOptions = brands.map((brand) => ({ value: brand.id, label: brand.name }))
  const canManage = can(session, "masters.manage")

  return (
    <>
      <SectionHeader
        title="Models and variants"
        description="Brand → model → variant (fuel, engine) → years. Open a model to manage its variants."
        actions={
          canManage && (
            <VehicleModelDialog
              brandOptions={brandOptions}
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Add model
                </Button>
              }
            />
          )
        }
      />
      <VehicleModelsTable
        data={data}
        brandOptions={brandOptions}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </>
  )
}
