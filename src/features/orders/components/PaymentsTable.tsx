"use client"

import { IndianRupee } from "lucide-react"

import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterBar } from "@/components/ui/FilterBar"
import { exportPaymentsAction } from "@/features/orders/actions"
import { paymentColumns } from "@/features/orders/payment-columns"
import type { PaymentRow } from "@/features/orders/types"
import {
  CHANNEL_OPTIONS,
  GATEWAY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/features/orders/utils"
import type { Paginated } from "@/lib/types"

const STATUS_OPTIONS = [{ value: "to_confirm", label: "To confirm" }, ...PAYMENT_STATUS_OPTIONS]

type PaymentsTableProps = { data: Paginated<PaymentRow>; canConfirm: boolean; canExport: boolean }

export function PaymentsTable({ data, canConfirm, canExport }: PaymentsTableProps) {
  return (
    <DataTable
      columns={paymentColumns(canConfirm)}
      data={data}
      getRowId={(row) => row.orderId}
      exportAction={canExport ? exportPaymentsAction : undefined}
      toolbar={
        <FilterBar
          searchPlaceholder="Search order, customer or reference"
          filters={[
            { type: "select", key: "status", label: "Status", options: STATUS_OPTIONS },
            { type: "select", key: "method", label: "Method", options: PAYMENT_METHOD_OPTIONS },
            { type: "select", key: "gateway", label: "Gateway", options: GATEWAY_OPTIONS },
            { type: "select", key: "channel", label: "Channel", options: CHANNEL_OPTIONS },
            { type: "dateRange", label: "Placed" },
          ]}
        />
      }
      emptyState={
        <EmptyState
          icon={IndianRupee}
          title="No payments yet"
          description="Each order's payment appears here."
        />
      }
    />
  )
}
