"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { ContentPage } from "@/features/content/types"
import { formatDateTime, humanize } from "@/lib/format"

export const pageColumns: ColumnDef<ContentPage>[] = [
  {
    id: "title",
    accessorKey: "title",
    meta: { label: "Page", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Page" />,
    cell: ({ row }) => (
      <Link href={`/content/pages/${row.original.id}`} className="flex flex-col">
        <span className="font-medium text-navy-700 hover:underline">{row.original.title}</span>
        <span className="text-xs text-gray-500">/{row.original.slug}</span>
      </Link>
    ),
  },
  {
    id: "kind",
    meta: { label: "Type" },
    enableSorting: false,
    header: "Type",
    cell: ({ row }) => (
      <span className="flex flex-col">
        {humanize(row.original.kind)}
        <span className="text-xs text-gray-500">
          {row.original.sections.length} section{row.original.sections.length === 1 ? "" : "s"}
        </span>
      </span>
    ),
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    meta: { label: "Last edited" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last edited" />,
    cell: ({ row }) => (
      <span className="flex flex-col whitespace-nowrap">
        {formatDateTime(row.original.updatedAt)}
        <span className="text-xs text-gray-500">{row.original.updatedBy.name}</span>
      </span>
    ),
  },
  {
    id: "published",
    meta: { label: "Status" },
    enableSorting: false,
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge domain="active" status={row.original.published ? "active" : "inactive"} />
    ),
  },
]
