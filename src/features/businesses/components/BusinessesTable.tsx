"use client"

import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportBusinessesAction } from "@/features/businesses/actions"
import { businessColumns } from "@/features/businesses/columns/businesses"
import type { BusinessListItem } from "@/features/businesses/types"
import {
  BUSINESS_STATUS_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  CREDIT_ON_OPTIONS,
} from "@/features/businesses/utils"
import type { Paginated } from "@/lib/types"

type BusinessesTableProps = { data: Paginated<BusinessListItem>; canExport: boolean }

export function BusinessesTable({ data, canExport }: BusinessesTableProps) {
  return (
    <DataTable
      columns={businessColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportBusinessesAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search name, owner, GSTIN or city"
          filters={[
            { type: "select", key: "type", label: "Type", options: BUSINESS_TYPE_OPTIONS },
            { type: "select", key: "status", label: "Account", options: BUSINESS_STATUS_OPTIONS },
            { type: "select", key: "credit", label: "Credit", options: CREDIT_ON_OPTIONS },
          ]}
        />
      }
    />
  )
}
