"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CornerDownRight, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import type { FilterOption } from "@/components/ui/FilterSelect"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Thumbnail } from "@/components/ui/Thumbnail"
import { ActiveToggleButton } from "@/features/masters/components/ActiveToggleButton"
import { CategoryDialog } from "@/features/masters/components/CategoryDialog"
import type { ProductCategoryListItem } from "@/features/masters/types"
import { formatNumber } from "@/lib/format"

export function categoryColumns(
  canManage: boolean,
  parentOptions: FilterOption[],
): ColumnDef<ProductCategoryListItem>[] {
  const columns: ColumnDef<ProductCategoryListItem>[] = [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Category", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.parentId && (
            <CornerDownRight aria-hidden className="size-4 shrink-0 text-gray-400" />
          )}
          <Thumbnail src={row.original.imageUrl} alt={row.original.name} />
          <div className="flex min-w-0 flex-col">
            <span className="font-medium text-gray-900">{row.original.name}</span>
            <span className="text-xs text-gray-500">
              {row.original.parentName ? `in ${row.original.parentName}` : "Top-level"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "sortOrder",
      accessorKey: "sortOrder",
      meta: { label: "Order", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => row.original.sortOrder,
    },
    {
      id: "subcategoryCount",
      meta: { label: "Subcategories", align: "right" },
      enableSorting: false,
      header: "Subcategories",
      cell: ({ row }) =>
        row.original.parentId ? "–" : formatNumber(row.original.subcategoryCount),
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
          <CategoryDialog
            category={row.original}
            parentOptions={parentOptions}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.name}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <ActiveToggleButton
            kind="productCategory"
            id={row.original.id}
            name={row.original.name}
            active={row.original.active}
            noun="category"
          />
        </div>
      ),
    },
  ]
}
