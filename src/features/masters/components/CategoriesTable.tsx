"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { categoryColumns } from "@/features/masters/columns/categories"
import { exportProductCategoriesAction } from "@/features/masters/exports"
import type { ProductCategoryListItem } from "@/features/masters/types"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

const LEVEL_OPTIONS: FilterOption[] = [
  { value: "top", label: "Categories" },
  { value: "sub", label: "Subcategories" },
]

type CategoriesTableProps = {
  data: Paginated<ProductCategoryListItem>
  parentOptions: FilterOption[]
  canManage: boolean
  canExport: boolean
}

export function CategoriesTable({
  data,
  parentOptions,
  canManage,
  canExport,
}: CategoriesTableProps) {
  return (
    <DataTable
      columns={categoryColumns(canManage, parentOptions)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportProductCategoriesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search categories"
          filters={[
            { type: "select", key: "parent", label: "Category", options: parentOptions },
            { type: "select", key: "level", label: "Level", options: LEVEL_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
    />
  )
}
