"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import type { CreditNote } from "@/features/credit-notes/types"
import { APPLIED_TO_LABELS } from "@/features/credit-notes/utils"
import { CHANNEL_LABELS } from "@/features/orders/utils"
import { formatDateTime } from "@/lib/format"

export const creditNoteColumns: ColumnDef<CreditNote>[] = [
  {
    id: "number",
    meta: { label: "Credit note", primary: true },
    enableHiding: false,
    enableSorting: false,
    header: "Credit note",
    cell: ({ row }) => (
      <Link href={`/credit-notes/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
        <span className="text-xs text-gray-500">
          {row.original.customer.name} · {CHANNEL_LABELS[row.original.channel]}
        </span>
      </Link>
    ),
  },
  {
    id: "source",
    meta: { label: "Order / return" },
    enableSorting: false,
    header: "Order / return",
    cell: ({ row }) => (
      <span className="flex flex-col">
        {row.original.orderNumber}
        <span className="text-xs text-gray-500">{row.original.returnNumber ?? "No return"}</span>
      </span>
    ),
  },
  {
    id: "issuedAt",
    accessorKey: "issuedAt",
    meta: { label: "Issued" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Issued" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{formatDateTime(row.original.issuedAt)}</span>
    ),
  },
  {
    id: "amount",
    accessorKey: "amount",
    meta: { label: "Amount (incl. GST)", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount (incl. GST)" />,
    cell: ({ row }) => <Price paise={row.original.amount} />,
  },
  {
    id: "appliedTo",
    meta: { label: "Applied to" },
    enableSorting: false,
    header: "Applied to",
    cell: ({ row }) => APPLIED_TO_LABELS[row.original.appliedTo],
  },
]
