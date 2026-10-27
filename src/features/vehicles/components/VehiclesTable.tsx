"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { FUEL_OPTIONS, VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"
import { exportVehiclesAction } from "@/features/vehicles/actions"
import { vehicleColumns } from "@/features/vehicles/columns"
import type { VehicleListItem } from "@/features/vehicles/types"
import { OWNER_OPTIONS } from "@/features/vehicles/utils"
import type { Paginated } from "@/lib/types"

type VehiclesTableProps = {
  data: Paginated<VehicleListItem>
  brandOptions: FilterOption[]
  modelOptions: FilterOption[]
  canExport: boolean
}

export function VehiclesTable({ data, brandOptions, modelOptions, canExport }: VehiclesTableProps) {
  return (
    <DataTable
      columns={vehicleColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportVehiclesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search registration, owner or chassis no."
          filters={[
            { type: "select", key: "type", label: "Type", options: VEHICLE_TYPE_OPTIONS },
            { type: "select", key: "brand", label: "Brand", options: brandOptions },
            { type: "select", key: "model", label: "Model", options: modelOptions },
            { type: "select", key: "fuel", label: "Fuel", options: FUEL_OPTIONS },
            { type: "select", key: "owner", label: "Owner", options: OWNER_OPTIONS },
          ]}
        />
      }
    />
  )
}
