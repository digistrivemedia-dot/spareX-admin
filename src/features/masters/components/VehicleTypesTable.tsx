"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { vehicleTypeColumns } from "@/features/masters/columns/vehicle-types"
import { exportVehicleTypesAction } from "@/features/masters/exports"
import type { VehicleTypeListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

export function VehicleTypesTable({
  data,
  canManage,
  canExport,
}: {
  data: Paginated<VehicleTypeListItem>
  canManage: boolean
  canExport: boolean
}) {
  return (
    <DataTable
      columns={vehicleTypeColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportVehicleTypesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search vehicle types"
          filters={[{ type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS }]}
        />
      }
    />
  )
}
