"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { BusinessListItem } from "@/features/businesses/types"
import { BUSINESS_TYPE_LABELS } from "@/features/businesses/utils"
import { formatDate, formatNumber, formatPercent } from "@/lib/format"

export const businessColumns: ColumnDef<BusinessListItem>[] = [
  {
    id: "name",
    accessorKey: "name",
    meta: { label: "Business", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
    cell: ({ row }) => (
      <Link href={`/businesses/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.name}</span>
        <span className="text-xs text-gray-500">{BUSINESS_TYPE_LABELS[row.original.type]}</span>
      </Link>
    ),
  },
  {
    id: "owner",
    meta: { label: "Owner" },
    enableSorting: false,
    header: "Owner",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{row.original.ownerName}</span>
        <span className="text-xs text-gray-500">{row.original.city}</span>
      </span>
    ),
  },
  {
    id: "discountPercent",
    accessorKey: "discountPercent",
    meta: { label: "Discount", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
    cell: ({ row }) => formatPercent(row.original.discountPercent),
  },
  {
    id: "credit",
    meta: { label: "Credit" },
    enableSorting: false,
    header: "Credit",
    cell: ({ row }) =>
      row.original.creditStatus ? (
        <StatusBadge domain="credit" status={row.original.creditStatus} />
      ) : (
        <span className="text-gray-500">Off</span>
      ),
  },
  {
    id: "orderCount",
    accessorKey: "orderCount",
    meta: { label: "Orders", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
    cell: ({ row }) => formatNumber(row.original.orderCount),
  },
  {
    id: "status",
    meta: { label: "Account" },
    enableSorting: false,
    header: "Account",
    cell: ({ row }) => <StatusBadge domain="business" status={row.original.status} />,
  },
  {
    id: "approvedAt",
    accessorKey: "approvedAt",
    meta: { label: "Verified" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Verified" />,
    cell: ({ row }) => formatDate(row.original.approvedAt),
  },
]
