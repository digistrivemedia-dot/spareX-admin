"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { Enquiry } from "@/features/enquiries/types"
import { ENQUIRY_KIND_LABELS } from "@/features/enquiries/utils"
import { formatAge, formatDate, formatPhone } from "@/lib/format"

export const enquiryColumns: ColumnDef<Enquiry>[] = [
  {
    id: "number",
    meta: { label: "Enquiry", primary: true },
    enableHiding: false,
    enableSorting: false,
    header: "Enquiry",
    cell: ({ row }) => (
      <Link href={`/enquiries/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.number}</span>
        <span className="text-xs text-gray-500">{ENQUIRY_KIND_LABELS[row.original.kind]}</span>
      </Link>
    ),
  },
  {
    id: "from",
    meta: { label: "From" },
    enableSorting: false,
    header: "From",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{row.original.name}</span>
        <span className="text-xs text-gray-500">
          {row.original.customerId
            ? formatPhone(row.original.phone)
            : `Guest · ${formatPhone(row.original.phone)}`}
        </span>
      </span>
    ),
  },
  {
    id: "vehicle",
    meta: { label: "Vehicle" },
    enableSorting: false,
    header: "Vehicle",
    cell: ({ row }) => {
      const { brand, model, variant, year } = row.original.vehicle
      return [brand, model, variant, year].filter(Boolean).join(" ")
    },
  },
  {
    id: "partQuery",
    meta: { label: "Part wanted" },
    enableSorting: false,
    header: "Part wanted",
    cell: ({ row }) => row.original.partQuery ?? "–",
  },
  {
    id: "status",
    accessorKey: "status",
    meta: { label: "Status" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge domain="enquiry" status={row.original.status} />,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    meta: { label: "Received" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />,
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{formatDate(row.original.createdAt)}</span>
        {row.original.status === "new" && (
          <span className="text-xs text-warning-700">
            Waiting {formatAge(row.original.createdAt)}
          </span>
        )}
      </span>
    ),
  },
]
