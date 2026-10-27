"use client"

import { ShoppingCart } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportOrdersAction } from "@/features/orders/actions"
import { orderColumns } from "@/features/orders/columns"
import type { Order } from "@/features/orders/types"
import {
  CHANNEL_OPTIONS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/features/orders/utils"
import type { Paginated } from "@/lib/types"

export function OrdersTable({ data, canExport }: { data: Paginated<Order>; canExport: boolean }) {
  return (
    <DataTable
      columns={orderColumns}
      data={data}
      getRowId={(row) => row.id}
      exportAction={canExport ? exportOrdersAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search order, customer, invoice or tracking no."
          filters={[
            { type: "select", key: "status", label: "Status", options: ORDER_STATUS_OPTIONS },
            { type: "select", key: "channel", label: "Channel", options: CHANNEL_OPTIONS },
            { type: "select", key: "payment", label: "Payment", options: PAYMENT_STATUS_OPTIONS },
            { type: "select", key: "method", label: "Method", options: PAYMENT_METHOD_OPTIONS },
            { type: "dateRange", label: "Placed" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="B2C and B2B orders appear here."
        />
      }
    />
  )
}
