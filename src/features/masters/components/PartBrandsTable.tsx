"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { partBrandColumns } from "@/features/masters/columns/part-brands"
import { exportPartBrandsAction } from "@/features/masters/exports"
import type { PartBrandListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

const OEM_OPTIONS = [
  { value: "yes", label: "Genuine (OEM)" },
  { value: "no", label: "Aftermarket" },
]

type PartBrandsTableProps = {
  data: Paginated<PartBrandListItem>
  canManage: boolean
  canExport: boolean
}

export function PartBrandsTable({ data, canManage, canExport }: PartBrandsTableProps) {
  return (
    <DataTable
      columns={partBrandColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportPartBrandsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search part brands"
          filters={[
            { type: "select", key: "oem", label: "Type", options: OEM_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
    />
  )
}
