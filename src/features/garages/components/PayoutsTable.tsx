"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportPayoutsAction } from "@/features/garages/actions"
import { payoutColumns } from "@/features/garages/columns"
import type { GaragePayout } from "@/features/garages/types"
import type { Paginated } from "@/lib/types"

const DUE_OPTIONS = [
  { value: "yes", label: "Money due" },
  { value: "no", label: "Nothing due" },
]

type PayoutsTableProps = { data: Paginated<GaragePayout>; canManage: boolean; canExport: boolean }

export function PayoutsTable({ data, canManage, canExport }: PayoutsTableProps) {
  return (
    <DataTable
      columns={payoutColumns(canManage)}
      data={data}
      getRowId={(row) => row.garageId}
      exportAction={canExport ? exportPayoutsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search garages"
          filters={[{ type: "select", key: "due", label: "Due", options: DUE_OPTIONS }]}
        />
      }
    />
  )
}
