"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { vehicleModelColumns } from "@/features/masters/columns/vehicle-models"
import { exportVehicleModelsAction } from "@/features/masters/exports"
import type { VehicleModelListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS, FUEL_OPTIONS, VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type VehicleModelsTableProps = {
  data: Paginated<VehicleModelListItem>
  brandOptions: FilterOption[]
  canManage: boolean
  canExport: boolean
}

export function VehicleModelsTable({
  data,
  brandOptions,
  canManage,
  canExport,
}: VehicleModelsTableProps) {
  return (
    <DataTable
      columns={vehicleModelColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportVehicleModelsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search models"
          filters={[
            { type: "select", key: "brand", label: "Brand", options: brandOptions },
            { type: "select", key: "type", label: "Type", options: VEHICLE_TYPE_OPTIONS },
            { type: "select", key: "fuel", label: "Fuel", options: FUEL_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
    />
  )
}
