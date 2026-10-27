"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { BUSINESS_STATUS_OPTIONS, BUSINESS_TYPE_OPTIONS } from "@/features/businesses/utils"
import { exportPricingAction } from "@/features/pricing/actions"
import { pricingColumns } from "@/features/pricing/columns"
import { DiscountDialog } from "@/features/pricing/components/DiscountDialog"
import type { PricingRow } from "@/features/pricing/types"
import type { Paginated } from "@/lib/types"

type PricingTableProps = {
  data: Paginated<PricingRow>
  withPreview: boolean
  canManage: boolean
  canExport: boolean
}

export function PricingTable({ data, withPreview, canManage, canExport }: PricingTableProps) {
  return (
    <DataTable
      columns={pricingColumns(canManage, withPreview)}
      data={data}
      getRowId={(row) => row.businessId}
      exportAction={canExport ? exportPricingAction : undefined}
      bulkActions={
        canManage
          ? (rows, clear) => (
              <DiscountDialog
                businessIds={rows.map((row) => row.businessId)}
                label={`${rows.length} business${rows.length === 1 ? "" : "es"}`}
                current={null}
                onDone={clear}
                trigger={
                  <Button size="sm" variant="outline">
                    Set discount
                  </Button>
                }
              />
            )
          : undefined
      }
      toolbar={
        <FilterBar
          searchPlaceholder="Search businesses"
          filters={[
            { type: "select", key: "type", label: "Type", options: BUSINESS_TYPE_OPTIONS },
            { type: "select", key: "status", label: "Account", options: BUSINESS_STATUS_OPTIONS },
          ]}
        />
      }
    />
  )
}
