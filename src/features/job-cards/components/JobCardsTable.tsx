"use client"

import { ClipboardList } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { exportJobCardsAction } from "@/features/job-cards/actions"
import { jobCardColumns } from "@/features/job-cards/columns"
import type { JobCard } from "@/features/job-cards/types"
import { JOB_CARD_STATUS_OPTIONS, PAYMENT_OPTIONS } from "@/features/job-cards/utils"
import type { Paginated } from "@/lib/types"

type JobCardsTableProps = {
  data: Paginated<JobCard>
  garageOptions: FilterOption[]
  canExport: boolean
}

export function JobCardsTable({ data, garageOptions, canExport }: JobCardsTableProps) {
  return (
    <DataTable
      columns={jobCardColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportJobCardsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search job card, registration, customer or garage"
          filters={[
            { type: "select", key: "status", label: "Status", options: JOB_CARD_STATUS_OPTIONS },
            { type: "select", key: "garage", label: "Garage", options: garageOptions },
            { type: "select", key: "payment", label: "Payment", options: PAYMENT_OPTIONS },
            { type: "dateRange", label: "Checked in" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={ClipboardList}
          title="No job cards yet"
          description="Garages open job cards on B2B at check-in."
        />
      }
    />
  )
}
