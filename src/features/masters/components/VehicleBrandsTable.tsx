"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { vehicleBrandColumns } from "@/features/masters/columns/vehicle-brands"
import { exportVehicleBrandsAction } from "@/features/masters/exports"
import type { VehicleBrandListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS, VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type VehicleBrandsTableProps = {
  data: Paginated<VehicleBrandListItem>
  canManage: boolean
  canExport: boolean
}

export function VehicleBrandsTable({ data, canManage, canExport }: VehicleBrandsTableProps) {
  return (
    <DataTable
      columns={vehicleBrandColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportVehicleBrandsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search brands"
          filters={[
            { type: "select", key: "type", label: "Type", options: VEHICLE_TYPE_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
    />
  )
}
