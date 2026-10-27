"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { CreditAccountListItem } from "@/features/businesses/types"

export const creditColumns: ColumnDef<CreditAccountListItem>[] = [
  {
    id: "businessName",
    accessorKey: "businessName",
    meta: { label: "Business", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
    cell: ({ row }) => (
      <Link
        href={`/credit/${row.original.id}`}
        className="font-medium text-navy-700 hover:underline"
      >
        {row.original.businessName}
      </Link>
    ),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="credit" status={row.original.status} />,
  },
  {
    id: "limit",
    accessorKey: "limit",
    meta: { label: "Limit", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Limit" />,
    cell: ({ row }) => <Price paise={row.original.limit} />,
  },
  {
    id: "outstanding",
    accessorKey: "outstanding",
    meta: { label: "Used", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Used" />,
    cell: ({ row }) => <Price paise={row.original.outstanding} />,
  },
  {
    id: "available",
    meta: { label: "Available", align: "right" },
    enableSorting: false,
    header: "Available",
    cell: ({ row }) => <Price paise={row.original.available} className="text-success-700" />,
  },
  {
    id: "overdue",
    accessorKey: "overdue",
    meta: { label: "Overdue", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Overdue" />,
    cell: ({ row }) =>
      row.original.overdue > 0 ? (
        <Price paise={row.original.overdue} className="text-danger-700" />
      ) : (
        <span className="text-gray-400">–</span>
      ),
  },
  {
    id: "termsDays",
    meta: { label: "Terms", align: "right" },
    enableSorting: false,
    header: "Terms",
    cell: ({ row }) => `Net ${row.original.termsDays}`,
  },
]
