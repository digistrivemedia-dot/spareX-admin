"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { serviceCategoryColumns } from "@/features/masters/columns/service-categories"
import { exportServiceCategoriesAction } from "@/features/masters/exports"
import type { ServiceCategoryListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type ServiceCategoriesTableProps = {
  data: Paginated<ServiceCategoryListItem>
  canManage: boolean
  canExport: boolean
}

export function ServiceCategoriesTable({
  data,
  canManage,
  canExport,
}: ServiceCategoriesTableProps) {
  return (
    <DataTable
      columns={serviceCategoryColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportServiceCategoriesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search service categories"
          filters={[{ type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS }]}
        />
      }
    />
  )
}
