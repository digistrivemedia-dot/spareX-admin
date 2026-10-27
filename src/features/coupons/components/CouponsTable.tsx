"use client"

import { TicketPercent } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportCouponsAction } from "@/features/coupons/actions"
import { couponColumns } from "@/features/coupons/columns"
import type { Coupon } from "@/features/coupons/types"
import { DISCOUNT_TYPE_OPTIONS, SCOPE_OPTIONS } from "@/features/coupons/utils"
import { ACTIVE_OPTIONS } from "@/features/masters/utils"
import type { Paginated } from "@/lib/types"

export function CouponsTable({ data, canExport }: { data: Paginated<Coupon>; canExport: boolean }) {
  return (
    <DataTable
      columns={couponColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportCouponsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search code or description"
          filters={[
            { type: "select", key: "scope", label: "Applies to", options: SCOPE_OPTIONS },
            { type: "select", key: "discountType", label: "Type", options: DISCOUNT_TYPE_OPTIONS },
            { type: "select", key: "active", label: "Status", options: ACTIVE_OPTIONS },
            { type: "dateRange", label: "Starts" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={TicketPercent}
          title="No coupons yet"
          description="Create percentage or flat offers for orders and service bookings."
        />
      }
    />
  )
}
