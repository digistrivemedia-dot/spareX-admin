"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MarkPaidDialog } from "@/features/orders/components/MarkPaidDialog"
import type { PaymentRow } from "@/features/orders/types"
import { CHANNEL_LABELS, PAYMENT_METHOD_LABELS } from "@/features/orders/utils"
import { formatDateTime, formatPrice } from "@/lib/format"

export function paymentColumns(canConfirm: boolean): ColumnDef<PaymentRow>[] {
  const columns: ColumnDef<PaymentRow>[] = [
    {
      id: "orderNumber",
      meta: { label: "Order", primary: true },
      enableHiding: false,
      enableSorting: false,
      header: "Order",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="flex flex-col">
          <span className="font-medium text-navy-700 hover:underline">
            {row.original.orderNumber}
          </span>
          <span className="text-xs text-gray-500">
            {row.original.customer.name} · {CHANNEL_LABELS[row.original.channel]}
          </span>
        </Link>
      ),
    },
    {
      id: "method",
      meta: { label: "Method" },
      enableSorting: false,
      header: "Method",
      cell: ({ row }) => (
        <span className="flex flex-col">
          {PAYMENT_METHOD_LABELS[row.original.method]}
          <span className="text-xs text-gray-500">
            {row.original.gateway === "razorpay" ? "Razorpay" : "Offline"}
          </span>
        </span>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      meta: { label: "Amount (incl. GST)", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount (incl. GST)" />,
      cell: ({ row }) => (
        <span className="flex flex-col items-end">
          <Price paise={row.original.amount} />
          {row.original.refundedAmount > 0 && (
            <span className="text-xs text-gray-500">
              {formatPrice(row.original.refundedAmount)} refunded
            </span>
          )}
        </span>
      ),
    },
    {
      id: "status",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => <StatusBadge domain="payment" status={row.original.status} />,
    },
    {
      id: "placedAt",
      accessorKey: "placedAt",
      meta: { label: "Paid / placed" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Paid / placed" />,
      cell: ({ row }) => (
        <span className="flex flex-col">
          <span className="whitespace-nowrap">
            {row.original.paidAt ? formatDateTime(row.original.paidAt) : "Not paid"}
          </span>
          <span className="text-xs text-gray-500">{row.original.reference ?? "No reference"}</span>
        </span>
      ),
    },
  ]
  if (!canConfirm) return columns
  return [
    ...columns,
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) =>
        row.original.needsConfirmation && (
          <div className="flex justify-end">
            <MarkPaidDialog
              orderId={row.original.orderId}
              orderNumber={row.original.orderNumber}
              method={row.original.method}
              amount={row.original.amount}
              size="sm"
            />
          </div>
        ),
    },
  ]
}
