"use client"

import { Undo2 } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { CHANNEL_OPTIONS } from "@/features/orders/utils"
import { exportReturnsAction } from "@/features/returns/actions"
import { returnColumns } from "@/features/returns/columns"
import type { ReturnRequest } from "@/features/returns/types"
import {
  RETURN_KIND_OPTIONS,
  RETURN_REASON_OPTIONS,
  RETURN_STATUS_OPTIONS,
} from "@/features/returns/utils"
import type { Paginated } from "@/lib/types"

export function ReturnsTable({
  data,
  canExport,
}: {
  data: Paginated<ReturnRequest>
  canExport: boolean
}) {
  return (
    <DataTable
      columns={returnColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportReturnsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search request, order, customer or product"
          filters={[
            { type: "select", key: "status", label: "Status", options: RETURN_STATUS_OPTIONS },
            { type: "select", key: "kind", label: "Type", options: RETURN_KIND_OPTIONS },
            { type: "select", key: "reason", label: "Reason", options: RETURN_REASON_OPTIONS },
            { type: "select", key: "channel", label: "Channel", options: CHANNEL_OPTIONS },
            { type: "dateRange", label: "Requested" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={Undo2}
          title="No returns or replacements"
          description="Requests from customers and businesses appear here."
        />
      }
    />
  )
}
