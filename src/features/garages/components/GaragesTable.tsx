"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportGaragesAction } from "@/features/garages/actions"
import { garageColumns } from "@/features/garages/columns"
import type { GarageListItem } from "@/features/garages/types"
import { GARAGE_STATUS_OPTIONS, OWNERSHIP_OPTIONS } from "@/features/garages/utils"
import type { Paginated } from "@/lib/types"

type GaragesTableProps = { data: Paginated<GarageListItem>; cities: string[]; canExport: boolean }

export function GaragesTable({ data, cities, canExport }: GaragesTableProps) {
  return (
    <DataTable
      columns={garageColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportGaragesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search garage, owner or area"
          filters={[
            { type: "select", key: "status", label: "Status", options: GARAGE_STATUS_OPTIONS },
            { type: "select", key: "ownership", label: "Ownership", options: OWNERSHIP_OPTIONS },
            {
              type: "select",
              key: "city",
              label: "City",
              options: cities.map((city) => ({ value: city, label: city })),
            },
          ]}
        />
      }
    />
  )
}
