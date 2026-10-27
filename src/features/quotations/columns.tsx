"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { Quotation } from "@/features/quotations/types"
import { formatDate, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export const quotationColumns: ColumnDef<Quotation>[] = [
  {
    id: "number",
    meta: { label: "Quotation", primary: true },
    enableHiding: false,
    enableSorting: false,
    header: "Quotation",
    cell: ({ row }) => (
      <Link href={`/quotations/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
        <span className="text-xs text-gray-500">{row.original.businessName}</span>
      </Link>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    meta: { label: "Requested" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Requested" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{formatDateTime(row.original.createdAt)}</span>
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
        <span className="text-xs text-gray-500">
          {row.original.lines.length} product{row.original.lines.length === 1 ? "" : "s"}
        </span>
      </span>
    ),
  },
  {
    id: "validUntil",
    accessorKey: "validUntil",
    meta: { label: "Valid until" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Valid until" />,
    cell: ({ row }) =>
      row.original.validUntil ? (
        <span
          className={cn(
            "whitespace-nowrap",
            row.original.status === "expired" && "font-medium text-danger-700",
          )}
        >
          {formatDate(row.original.validUntil)}
        </span>
      ) : (
        <span className="text-gray-500">Not sent</span>
      ),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="quotation" status={row.original.status} />,
  },
]
