import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getVehicleBrandOptions, getVehicleModelOptions } from "@/features/masters/api"
import { vehiclesApi } from "@/features/vehicles/api"
import { VehiclesTable } from "@/features/vehicles/components/VehiclesTable"
import { VEHICLE_FILTERS } from "@/features/vehicles/utils"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Vehicles" }

export default async function VehiclesPage({ searchParams }: PageProps<"/vehicles">) {
  const session = await requirePermission("vehicles.view")
  const token = await requireToken()
  const query = await searchParams
  const params = parseListParams(query, {
    filterKeys: VEHICLE_FILTERS,
    defaultSort: { field: "createdAt", direction: "desc" },
  })
  const [data, brands, models] = await Promise.all([
    vehiclesApi.list(token, params),
    getVehicleBrandOptions(token),
    getVehicleModelOptions(token),
  ])
  // With a brand chosen, the model filter only offers that brand's models.
  const brandId = params.filters.brand

  return (
    <Container>
      <PageHeader
        title="Vehicles"
        description="Every vehicle customers have added or garages have checked in, with its service record."
      />
      <VehiclesTable
        data={data}
        brandOptions={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
        modelOptions={models
          .filter((model) => !brandId || model.brandId === brandId)
          .map((model) => ({ value: model.id, label: `${model.brandName} ${model.name}` }))}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
