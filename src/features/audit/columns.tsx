"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import type { AuditEntry } from "@/features/audit/types"
import { auditRecordHref } from "@/features/audit/utils"
import { formatDateTime, humanize } from "@/lib/format"

export const auditColumns: ColumnDef<AuditEntry>[] = [
  {
    id: "at",
    accessorKey: "at",
    meta: { label: "When" },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="When" />,
    cell: ({ row }) => (
      <time dateTime={row.original.at} className="whitespace-nowrap">
        {formatDateTime(row.original.at)}
      </time>
    ),
  },
  {
    id: "actor",
    accessorFn: (entry) => entry.actor.name,
    meta: { label: "Who" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Who" />,
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.actor.name}</span>,
  },
  {
    id: "summary",
    accessorKey: "summary",
    meta: { label: "What", primary: true },
    enableSorting: false,
    header: "What",
    cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.summary}</span>,
  },
  {
    id: "entity",
    accessorKey: "entity",
    meta: { label: "Record" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Record" />,
    cell: ({ row }) => {
      const { entity, entityId, entityLabel } = row.original
      const href = auditRecordHref(entity, entityId)
      return (
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-gray-500">{humanize(entity)}</span>
          {href ? (
            <Link href={href} className="truncate text-navy-700 hover:underline">
              {entityLabel}
            </Link>
          ) : (
            <span className="truncate">{entityLabel}</span>
          )}
        </div>
      )
    },
  },
  {
    id: "changes",
    meta: { label: "Before → after" },
    enableSorting: false,
    header: "Before → after",
    cell: ({ row }) =>
      row.original.changes.length === 0 ? (
        <span className="text-gray-400">–</span>
      ) : (
        <ul className="flex flex-col gap-0.5 text-xs">
          {row.original.changes.map((change) => (
            <li key={change.field}>
              <span className="text-gray-500">{change.field}:</span>{" "}
              <span className="text-gray-500 line-through">{change.before ?? "–"}</span> →{" "}
              <span className="font-medium text-gray-900">{change.after ?? "–"}</span>
            </li>
          ))}
        </ul>
      ),
  },
]
