"use client"

import { FileCheck2 } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportApplicationsAction } from "@/features/businesses/actions"
import { applicationColumns } from "@/features/businesses/columns/applications"
import type { BusinessApplication } from "@/features/businesses/types"
import { APPLICATION_STATUS_OPTIONS, BUSINESS_TYPE_OPTIONS } from "@/features/businesses/utils"
import type { Paginated } from "@/lib/types"

type ApplicationsTableProps = { data: Paginated<BusinessApplication>; canExport: boolean }

export function ApplicationsTable({ data, canExport }: ApplicationsTableProps) {
  return (
    <DataTable
      columns={applicationColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportApplicationsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search business, contact, GSTIN or city"
          filters={[
            { type: "select", key: "status", label: "Status", options: APPLICATION_STATUS_OPTIONS },
            { type: "select", key: "type", label: "Type", options: BUSINESS_TYPE_OPTIONS },
            { type: "dateRange", label: "Submitted" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={FileCheck2}
          title="No applications"
          description="Businesses that apply on the B2B site appear here for verification."
        />
      }
    />
  )
}
