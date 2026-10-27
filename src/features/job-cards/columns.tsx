"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { JobCard } from "@/features/job-cards/types"
import { jobCardValue } from "@/features/job-cards/utils"
import { formatDate } from "@/lib/format"

export const jobCardColumns: ColumnDef<JobCard>[] = [
  {
    id: "number",
    meta: { label: "Job card", primary: true },
    enableHiding: false,
    enableSorting: false,
    header: "Job card",
    cell: ({ row }) => (
      <Link href={`/job-cards/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
        <span className="text-xs text-gray-500">{row.original.garageName}</span>
      </Link>
    ),
  },
  {
    id: "vehicle",
    meta: { label: "Vehicle" },
    enableSorting: false,
    header: "Vehicle",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span className="whitespace-nowrap">{row.original.registrationNumber}</span>
        <span className="text-xs text-gray-500">
          {row.original.customer?.name ?? "Walk-in, not linked"}
        </span>
      </span>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    meta: { label: "Checked in" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Checked in" />,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="jobCard" status={row.original.status} />,
  },
  {
    id: "value",
    accessorFn: jobCardValue,
    meta: { label: "Value (incl. GST)", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Value (incl. GST)" />,
    cell: ({ row }) => {
      const value = jobCardValue(row.original)
      return value > 0 ? <Price paise={value} /> : <span className="text-gray-400">–</span>
    },
  },
  {
    id: "payment",
    meta: { label: "Payment" },
    enableSorting: false,
    header: "Payment",
    cell: ({ row }) => <StatusBadge domain="jobCardPayment" status={row.original.payment.status} />,
  },
]
