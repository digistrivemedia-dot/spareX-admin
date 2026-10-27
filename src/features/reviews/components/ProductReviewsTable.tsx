"use client"

import { Star } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportProductReviewsAction } from "@/features/reviews/actions"
import { productReviewColumns } from "@/features/reviews/columns"
import type { ProductReview } from "@/features/reviews/types"
import { RATING_OPTIONS, REVIEW_STATUS_OPTIONS } from "@/features/reviews/utils"
import type { Paginated } from "@/lib/types"

const STATUS_OPTIONS = [{ value: "pending", label: "Pending" }, ...REVIEW_STATUS_OPTIONS]

type ProductReviewsTableProps = {
  data: Paginated<ProductReview>
  canManage: boolean
  canExport: boolean
}

export function ProductReviewsTable({ data, canManage, canExport }: ProductReviewsTableProps) {
  return (
    <DataTable
      columns={productReviewColumns(canManage)}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportProductReviewsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search product, customer or review"
          filters={[
            { type: "select", key: "status", label: "Status", options: STATUS_OPTIONS },
            { type: "select", key: "rating", label: "Rating", options: RATING_OPTIONS },
            { type: "dateRange", label: "Posted" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={Star}
          title="No product reviews yet"
          description="Reviews customers write on products appear here for moderation."
        />
      }
    />
  )
}
