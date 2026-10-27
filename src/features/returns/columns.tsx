"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { CHANNEL_LABELS } from "@/features/orders/utils"
import type { ReturnRequest } from "@/features/returns/types"
import { returnAmount } from "@/features/returns/utils"
import { formatAge, formatDateTime, humanize } from "@/lib/format"

export const returnColumns: ColumnDef<ReturnRequest>[] = [
  {
    id: "number",
    meta: { label: "Request", primary: true },
    enableHiding: false,
    enableSorting: false,
    header: "Request",
    cell: ({ row }) => (
      <Link href={`/returns/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
        <span className="text-xs text-gray-500">
          {row.original.customer.name} · {CHANNEL_LABELS[row.original.channel]}
        </span>
      </Link>
    ),
  },
  {
    id: "kind",
    meta: { label: "Type and reason" },
    enableSorting: false,
    header: "Type and reason",
    cell: ({ row }) => (
      <span className="flex flex-col">
        {humanize(row.original.kind)}
        <span className="text-xs text-gray-500">{humanize(row.original.reason)}</span>
      </span>
    ),
  },
  {
    id: "requestedAt",
    accessorKey: "requestedAt",
    meta: { label: "Requested" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
    cell: ({ row }) => (
      <span className="flex flex-col whitespace-nowrap">
        {formatDateTime(row.original.requestedAt)}
        <span className="text-xs text-gray-500">
          {row.original.orderNumber} · {formatAge(row.original.requestedAt)}
        </span>
      </span>
    ),
  },
  {
    id: "amount",
    meta: { label: "Amount (incl. GST)", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount (incl. GST)" />,
    cell: ({ row }) => <Price paise={returnAmount(row.original)} />,
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="return" status={row.original.status} />,
  },
]
