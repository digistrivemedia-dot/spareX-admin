"use client"

import { Star } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { exportGarageReviewsAction } from "@/features/reviews/actions"
import { garageReviewColumns } from "@/features/reviews/columns"
import type { GarageReview } from "@/features/reviews/types"
import { RATING_OPTIONS, REVIEW_STATUS_OPTIONS } from "@/features/reviews/utils"
import type { Paginated } from "@/lib/types"

type GarageReviewsTableProps = {
  data: Paginated<GarageReview>
  garageOptions: FilterOption[]
  canManage: boolean
  canExport: boolean
}

export function GarageReviewsTable({
  data,
  garageOptions,
  canManage,
  canExport,
}: GarageReviewsTableProps) {
  return (
    <DataTable
      columns={garageReviewColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportGarageReviewsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search garage, customer or comment"
          filters={[
            { type: "select", key: "status", label: "Status", options: REVIEW_STATUS_OPTIONS },
            { type: "select", key: "rating", label: "Rating", options: RATING_OPTIONS },
            { type: "select", key: "garage", label: "Garage", options: garageOptions },
            { type: "dateRange", label: "Posted" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={Star}
          title="No garage ratings yet"
          description="Customers rate a garage after a completed booking."
        />
      }
    />
  )
}
