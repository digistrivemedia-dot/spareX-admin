"use client"

import { FileText } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { exportQuotationsAction } from "@/features/quotations/actions"
import { quotationColumns } from "@/features/quotations/columns"
import type { Quotation } from "@/features/quotations/types"
import { QUOTATION_STATUS_OPTIONS } from "@/features/quotations/utils"
import type { Paginated } from "@/lib/types"

type QuotationsTableProps = {
  data: Paginated<Quotation>
  businessOptions: FilterOption[]
  canExport: boolean
}

export function QuotationsTable({ data, businessOptions, canExport }: QuotationsTableProps) {
  return (
    <DataTable
      columns={quotationColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportQuotationsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search quotation, business or product"
          filters={[
            { type: "select", key: "status", label: "Status", options: QUOTATION_STATUS_OPTIONS },
            { type: "select", key: "business", label: "Business", options: businessOptions },
            { type: "dateRange", label: "Requested" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={FileText}
          title="No quotations yet"
          description="Quotation requests from B2B businesses appear here."
        />
      }
    />
  )
}
