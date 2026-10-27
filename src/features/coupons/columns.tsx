"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { Coupon } from "@/features/coupons/types"
import { couponState, describeDiscount, SCOPE_LABELS } from "@/features/coupons/utils"
import { formatDate, formatNumber, formatPrice } from "@/lib/format"

export const couponColumns: ColumnDef<Coupon>[] = [
  {
    id: "code",
    accessorKey: "code",
    meta: { label: "Coupon", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Coupon" />,
    cell: ({ row }) => (
      <Link href={`/coupons/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.code}</span>
        <span className="text-xs text-gray-500">{row.original.description}</span>
      </Link>
    ),
  },
  {
    id: "discount",
    meta: { label: "Discount" },
    enableSorting: false,
    header: "Discount",
    cell: ({ row }) => (
      <span className="flex flex-col">
        {describeDiscount(row.original)}
        <span className="text-xs text-gray-500">
          {SCOPE_LABELS[row.original.scope]}
          {row.original.minOrderValue > 0 && ` · min. ${formatPrice(row.original.minOrderValue)}`}
        </span>
      </span>
    ),
  },
  {
    id: "startsAt",
    accessorKey: "startsAt",
    meta: { label: "Validity" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Validity" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatDate(row.original.startsAt)} –{" "}
        {row.original.endsAt ? formatDate(row.original.endsAt) : "no end date"}
      </span>
    ),
  },
  {
    id: "usedCount",
    accessorKey: "usedCount",
    meta: { label: "Used", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Used" />,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatNumber(row.original.usedCount)}
        {row.original.usageLimit !== null && ` / ${formatNumber(row.original.usageLimit)}`}
      </span>
    ),
  },
  {
    id: "state",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="coupon" status={couponState(row.original)} />,
  },
]
