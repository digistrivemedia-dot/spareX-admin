"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { CustomerListItem } from "@/features/customers/types"
import { formatDate, formatNumber, formatPhone } from "@/lib/format"

export const customerColumns: ColumnDef<CustomerListItem>[] = [
  {
    id: "name",
    accessorKey: "name",
    meta: { label: "Customer", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => (
      <Link href={`/customers/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.name}</span>
        <span className="text-xs text-gray-500">{row.original.email || "–"}</span>
      </Link>
    ),
  },
  {
    id: "phone",
    meta: { label: "Mobile" },
    enableSorting: false,
    header: "Mobile",
    cell: ({ row }) => (row.original.phone ? formatPhone(row.original.phone) : "–"),
  },
  {
    id: "city",
    meta: { label: "City" },
    enableSorting: false,
    header: "City",
    cell: ({ row }) => row.original.city || "–",
  },
  {
    id: "vehicleCount",
    meta: { label: "Vehicles", align: "right" },
    enableSorting: false,
    header: "Vehicles",
    cell: ({ row }) => formatNumber(row.original.vehicleCount),
  },
  {
    id: "orderCount",
    accessorKey: "orderCount",
    meta: { label: "Orders", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
    cell: ({ row }) => formatNumber(row.original.orderCount),
  },
  {
    id: "totalSpend",
    accessorKey: "totalSpend",
    meta: { label: "Total spend (incl. GST)", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Spend (incl. GST)" />,
    cell: ({ row }) => <Price paise={row.original.totalSpend} />,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    meta: { label: "Joined" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="customer" status={row.original.status} />,
  },
]
