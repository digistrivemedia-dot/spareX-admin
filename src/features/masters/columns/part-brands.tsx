"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Thumbnail } from "@/components/ui/Thumbnail"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { PartBrandDialog } from "@/features/masters/components/PartBrandDialog"
import type { PartBrandListItem } from "@/features/masters/types"
import { formatNumber } from "@/lib/format"

export function partBrandColumns(canManage: boolean): ColumnDef<PartBrandListItem>[] {
  const columns: ColumnDef<PartBrandListItem>[] = [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Part brand", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Part brand" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Thumbnail src={row.original.logoUrl} alt={`${row.original.name} logo`} />
          <span className="font-medium text-gray-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "isOem",
      meta: { label: "Type" },
      enableSorting: false,
      header: "Type",
      cell: ({ row }) =>
        row.original.isOem ? <Badge variant="secondary">Genuine (OEM)</Badge> : "Aftermarket",
    },
    {
      id: "productCount",
      accessorKey: "productCount",
      meta: { label: "Products", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Products" />,
      cell: ({ row }) => formatNumber(row.original.productCount),
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
          <PartBrandDialog
            brand={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <ActiveToggleButton
            kind="partBrand"
            id={row.original.id}
            name={row.original.name}
            active={row.original.active}
            noun="part brand"
          />
        </div>
      ),
    },
  ]
}
