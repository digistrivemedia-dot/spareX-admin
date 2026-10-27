"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { Order } from "@/features/orders/types"
import { CHANNEL_LABELS, PAYMENT_METHOD_LABELS } from "@/features/orders/utils"
import { formatDateTime } from "@/lib/format"

function itemCount(order: Order): string {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0)
  return `${count} item${count === 1 ? "" : "s"}`
}

export const orderColumns: ColumnDef<Order>[] = [
  {
    id: "number",
    accessorKey: "number",
    meta: { label: "Order", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
    cell: ({ row }) => (
      <Link href={`/orders/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
        <span className="text-xs text-gray-500">{row.original.customer.name}</span>
      </Link>
    ),
  },
  {
    id: "channel",
    meta: { label: "Channel" },
    enableSorting: false,
    header: "Channel",
    cell: ({ row }) => CHANNEL_LABELS[row.original.channel],
  },
  {
    id: "placedAt",
    accessorKey: "placedAt",
    meta: { label: "Placed" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Placed" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{formatDateTime(row.original.placedAt)}</span>
    ),
  },
  {
    id: "total",
    accessorKey: "total",
    meta: { label: "Total (incl. GST)", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total (incl. GST)" />,
    cell: ({ row }) => (
      <span className="flex flex-col items-end">
        <Price paise={row.original.total} />
        <span className="text-xs text-gray-500">{itemCount(row.original)}</span>
      </span>
    ),
  },
  {
    id: "payment",
    meta: { label: "Payment" },
    enableSorting: false,
    header: "Payment",
    cell: ({ row }) => (
      <span className="flex flex-col items-start gap-1">
        <StatusBadge domain="payment" status={row.original.payment.status} />
        <span className="text-xs text-gray-500">
          {PAYMENT_METHOD_LABELS[row.original.payment.method]}
        </span>
      </span>
    ),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="order" status={row.original.status} />,
  },
]
