"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { serviceColumns } from "@/features/masters/columns/services"
import { exportServicesAction } from "@/features/masters/exports"
import type { ServiceItemListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS, VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type ServicesTableProps = {
  data: Paginated<ServiceItemListItem>
  categoryOptions: FilterOption[]
  canManage: boolean
  canExport: boolean
}

export function ServicesTable({ data, categoryOptions, canManage, canExport }: ServicesTableProps) {
  return (
    <DataTable
      columns={serviceColumns(canManage, categoryOptions)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportServicesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search services"
          filters={[
            { type: "select", key: "category", label: "Category", options: categoryOptions },
            { type: "select", key: "type", label: "Type", options: VEHICLE_TYPE_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
    />
  )
}
