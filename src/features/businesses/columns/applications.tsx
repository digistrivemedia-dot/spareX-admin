"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { BusinessApplication } from "@/features/businesses/types"
import { BUSINESS_TYPE_LABELS } from "@/features/businesses/utils"
import { formatAge, formatDate } from "@/lib/format"

const WAITING = ["submitted", "under_review"]

export const applicationColumns: ColumnDef<BusinessApplication>[] = [
  {
    id: "businessName",
    accessorKey: "businessName",
    meta: { label: "Business", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
    cell: ({ row }) => (
      <Link href={`/applications/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">
          {row.original.businessName}
        </span>
        <span className="text-xs text-gray-500">
          {row.original.number} · {BUSINESS_TYPE_LABELS[row.original.type]}
        </span>
      </Link>
    ),
  },
  {
    id: "contact",
    meta: { label: "Contact" },
    enableSorting: false,
    header: "Contact",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{row.original.contactName}</span>
        <span className="text-xs text-gray-500">{row.original.address.city}</span>
      </span>
    ),
  },
  {
    id: "gstin",
    meta: { label: "GSTIN" },
    enableSorting: false,
    header: "GSTIN",
    cell: ({ row }) => <span className="tabular-nums">{row.original.gstin}</span>,
  },
  {
    id: "submittedAt",
    accessorKey: "submittedAt",
    meta: { label: "Submitted" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{formatDate(row.original.submittedAt)}</span>
        {WAITING.includes(row.original.status) && (
          <span className="text-xs text-warning-700">
            Waiting {formatAge(row.original.submittedAt)}
          </span>
        )}
      </span>
    ),
  },
  {
    id: "status",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => <StatusBadge domain="application" status={row.original.status} />,
  },
]
