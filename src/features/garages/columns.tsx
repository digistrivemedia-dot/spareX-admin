"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Star } from "lucide-react"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { SettlePayoutDialog } from "@/features/garages/components/SettlePayoutDialog"
import type { GarageListItem, GaragePayout } from "@/features/garages/types"
import { formatDate, formatNumber } from "@/lib/format"

export const garageColumns: ColumnDef<GarageListItem>[] = [
  {
    id: "name",
    accessorKey: "name",
    meta: { label: "Garage", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Garage" />,
    cell: ({ row }) => (
      <Link href={`/garages/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.name}</span>
        <span className="text-xs text-gray-500">
          {row.original.ownership === "kannali" ? "Kannali-owned" : "Partner"}
        </span>
      </Link>
    ),
  },
  {
    id: "city",
    meta: { label: "City" },
    enableSorting: false,
    header: "City",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{row.original.city}</span>
        <span className="text-xs text-gray-500">{row.original.address.line2}</span>
      </span>
    ),
  },
  {
    id: "rating",
    accessorKey: "rating",
    meta: { label: "Rating", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) =>
      row.original.ratingCount ? (
        <span className="inline-flex items-center gap-1">
          <Star aria-hidden className="size-3.5 fill-warning-500 text-warning-500" />
          <span className="font-semibold">{row.original.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({formatNumber(row.original.ratingCount)})</span>
        </span>
      ) : (
        <span className="text-gray-400">No ratings</span>
      ),
  },
  {
    id: "serviceCount",
    meta: { label: "Services", align: "right" },
    enableSorting: false,
    header: "Services",
    cell: ({ row }) => formatNumber(row.original.serviceCount),
  },
  {
    id: "pickAndDrop",
    meta: { label: "Pick and drop" },
    enableSorting: false,
    header: "Pick and drop",
    cell: ({ row }) => (row.original.pickAndDrop ? "Yes" : "No"),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="garage" status={row.original.status} />,
  },
]

export function payoutColumns(canManage: boolean): ColumnDef<GaragePayout>[] {
  const columns: ColumnDef<GaragePayout>[] = [
    {
      id: "garageName",
      accessorKey: "garageName",
      meta: { label: "Garage", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Garage" />,
      cell: ({ row }) => (
        <Link
          href={`/garages/${row.original.garageId}`}
          className="font-medium text-navy-700 hover:underline"
        >
          {row.original.garageName}
        </Link>
      ),
    },
    {
      id: "unsettledAmount",
      accessorKey: "unsettledAmount",
      meta: { label: "Due to garage", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Due to garage" />,
      cell: ({ row }) => (
        <span className="flex flex-col items-end">
          <Price paise={row.original.unsettledAmount} />
          <span className="text-xs text-gray-500">
            {row.original.unsettledCount} payment{row.original.unsettledCount === 1 ? "" : "s"}
          </span>
        </span>
      ),
    },
    {
      id: "settledAmount",
      meta: { label: "Settled so far", align: "right" },
      enableSorting: false,
      header: "Settled so far",
      cell: ({ row }) => <Price paise={row.original.settledAmount} />,
    },
    {
      id: "lastSettledAt",
      meta: { label: "Last settled" },
      enableSorting: false,
      header: "Last settled",
      cell: ({ row }) =>
        row.original.lastSettledAt
          ? `${formatDate(row.original.lastSettledAt)} · ${row.original.lastReference}`
          : "Never",
    },
  ]
  if (!canManage) return columns
  return [
    ...columns,
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <SettlePayoutDialog payout={row.original} />
        </div>
      ),
    },
  ]
}
