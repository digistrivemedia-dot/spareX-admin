"use client"

import { PackageSearch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { productColumns } from "@/features/catalog/columns/products"
import { ProductActiveButton } from "@/features/catalog/components/ProductActiveButton"
import { exportProductsAction } from "@/features/catalog/exports"
import type { ProductListItem } from "@/features/catalog/types"
import { FITMENT_OPTIONS, STOCK_STATUS_OPTIONS } from "@/features/catalog/utils"
import { ACTIVE_OPTIONS, VEHICLE_TYPE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

type ProductsTableProps = {
  data: Paginated<ProductListItem>
  categoryOptions: FilterOption[]
  brandOptions: FilterOption[]
  canManage: boolean
  canExport: boolean
}

export function ProductsTable({
  data,
  categoryOptions,
  brandOptions,
  canManage,
  canExport,
}: ProductsTableProps) {
  return (
    <DataTable
      columns={productColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportProductsAction : undefined}
      bulkActions={
        canManage
          ? (rows, clear) => {
              const label = `${rows.length} product${rows.length === 1 ? "" : "s"}`
              const ids = rows.map((row) => row.id)
              return (
                <>
                  <ProductActiveButton
                    ids={ids}
                    label={label}
                    active={false}
                    onDone={clear}
                    trigger={
                      <Button size="sm" variant="outline">
                        Activate
                      </Button>
                    }
                  />
                  <ProductActiveButton
                    ids={ids}
                    label={label}
                    active
                    onDone={clear}
                    trigger={
                      <Button size="sm" variant="outline">
                        Deactivate
                      </Button>
                    }
                  />
                </>
              )
            }
          : undefined
      }
      toolbar={
        <FilterBar
          searchPlaceholder="Search name, SKU or part no."
          filters={[
            { type: "select", key: "category", label: "Category", options: categoryOptions },
            { type: "select", key: "brand", label: "Brand", options: brandOptions },
            { type: "select", key: "type", label: "Vehicle", options: VEHICLE_TYPE_OPTIONS },
            { type: "select", key: "stock", label: "Stock", options: STOCK_STATUS_OPTIONS },
            { type: "select", key: "fitment", label: "Fitment", options: FITMENT_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={PackageSearch}
          title="No products yet"
          description="Add a product or import them from CSV."
        />
      }
    />
  )
}
