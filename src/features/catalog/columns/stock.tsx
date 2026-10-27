"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { History } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { QuickViewDrawer } from "@/components/ui/QuickViewDrawer"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { StockAdjustDialog } from "@/features/catalog/components/StockAdjustDialog"
import { StockHistory } from "@/features/catalog/components/StockHistory"
import type { StockListItem } from "@/features/catalog/types"
import { formatDateTime, formatNumber } from "@/lib/format"

export function stockColumns(canManage: boolean): ColumnDef<StockListItem>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Product", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
      cell: ({ row }) => (
        <Link href={`/products/${row.original.id}`} className="flex flex-col">
          <span className="line-clamp-2 font-medium text-navy-700 hover:underline">
            {row.original.name}
          </span>
          <span className="text-xs text-gray-500">
            {row.original.sku} · {row.original.categoryName}
          </span>
        </Link>
      ),
    },
    {
      id: "stock",
      accessorKey: "stock",
      meta: { label: "In stock", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="In stock" />,
      cell: ({ row }) => <span className="font-semibold">{formatNumber(row.original.stock)}</span>,
    },
    {
      id: "lowStockLevel",
      meta: { label: "Low at", align: "right" },
      enableSorting: false,
      header: "Low at",
      cell: ({ row }) => formatNumber(row.original.lowStockLevel),
    },
    {
      id: "stockStatus",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => <StatusBadge domain="stock" status={row.original.stockStatus} />,
    },
    {
      id: "lastAdjustedAt",
      accessorKey: "lastAdjustedAt",
      meta: { label: "Last adjusted" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last adjusted" />,
      cell: ({ row }) =>
        row.original.lastAdjustedAt ? formatDateTime(row.original.lastAdjustedAt) : "–",
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <QuickViewDrawer
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Stock history of ${row.original.name}`}
              >
                <History aria-hidden />
              </Button>
            }
            title="Stock history"
            description={row.original.name}
            href={`/products/${row.original.id}`}
          >
            <StockHistory productId={row.original.id} />
          </QuickViewDrawer>
          {canManage && <StockAdjustDialog item={row.original} />}
        </div>
      ),
    },
  ]
}
