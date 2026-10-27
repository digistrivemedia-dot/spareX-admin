"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { stockColumns } from "@/features/catalog/columns/stock"
import { exportStockAction } from "@/features/catalog/exports"
import type { StockListItem } from "@/features/catalog/types"
import { STOCK_STATUS_OPTIONS } from "@/features/catalog/utils"
import type { Paginated } from "@/lib/types"

type StockTableProps = {
  data: Paginated<StockListItem>
  categoryOptions: FilterOption[]
  canManage: boolean
  canExport: boolean
}

export function StockTable({ data, categoryOptions, canManage, canExport }: StockTableProps) {
  return (
    <DataTable
      columns={stockColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportStockAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search name or SKU"
          filters={[
            { type: "select", key: "stock", label: "Stock", options: STOCK_STATUS_OPTIONS },
            { type: "select", key: "category", label: "Category", options: categoryOptions },
          ]}
        />
      }
    />
  )
}
