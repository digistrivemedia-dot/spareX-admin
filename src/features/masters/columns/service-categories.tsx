"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { ServiceCategoryDialog } from "@/features/masters/components/ServiceCategoryDialog"
import type { ServiceCategoryListItem } from "@/features/masters/types"
import { formatNumber } from "@/lib/format"

export function serviceCategoryColumns(canManage: boolean): ColumnDef<ServiceCategoryListItem>[] {
  const columns: ColumnDef<ServiceCategoryListItem>[] = [
    {
      id: "sortOrder",
      accessorKey: "sortOrder",
      meta: { label: "Order" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.sortOrder}</span>,
    },
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Category", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      id: "serviceCount",
      accessorKey: "serviceCount",
      meta: { label: "Services", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Services" />,
      cell: ({ row }) => (
        <Link
          href={`/masters/services?category=${row.original.id}`}
          className="text-navy-700 hover:underline"
        >
          {formatNumber(row.original.serviceCount)}
        </Link>
      ),
    },
    {
      id: "active",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge domain="active" status={row.original.active ? "active" : "inactive"} />
      ),
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
        <div className="flex justify-end gap-1">
          <ServiceCategoryDialog
            category={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <ActiveToggleButton
            kind="serviceCategory"
            id={row.original.id}
            name={row.original.name}
            active={row.original.active}
            noun="service category"
          />
        </div>
      ),
    },
  ]
}
