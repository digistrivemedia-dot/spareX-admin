"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Thumbnail } from "@/components/ui/Thumbnail"
import type { ProductListItem } from "@/features/catalog/types"
import { formatNumber, formatPrice } from "@/lib/format"

/** Activate / deactivate lives on the product page and in the bulk actions, which keeps the row narrow. */
export const productColumns: ColumnDef<ProductListItem>[] = [
  {
    id: "name",
    accessorKey: "name",
    meta: { label: "Product", primary: true },
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
    cell: ({ row }) => (
      <Link href={`/products/${row.original.id}`} className="flex items-center gap-3">
        <Thumbnail src={row.original.images[0] ?? null} alt={row.original.name} />
        <span className="flex min-w-0 flex-col">
          <span className="line-clamp-2 font-medium text-navy-700 hover:underline">
            {row.original.name}
          </span>
          <span className="text-xs text-gray-500">
            {row.original.partBrandName} · {row.original.sku}
          </span>
        </span>
      </Link>
    ),
  },
  {
    id: "category",
    meta: { label: "Category" },
    enableSorting: false,
    header: "Category",
    cell: ({ row }) => (
      <span className="flex flex-col">
        <span>{row.original.categoryName}</span>
        <span className="text-xs text-gray-500">{row.original.subcategoryName}</span>
      </span>
    ),
  },
  {
    id: "price",
    accessorKey: "price",
    meta: { label: "Price (incl. GST)", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price (incl. GST)" />,
    cell: ({ row }) => (
      <span className="flex flex-col items-end">
        <Price paise={row.original.price} />
        <span className="text-xs text-gray-500 line-through">{formatPrice(row.original.mrp)}</span>
      </span>
    ),
  },
  {
    id: "stock",
    accessorKey: "stock",
    meta: { label: "Stock", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => (
      <span className="flex flex-col items-end gap-1">
        <span className="font-semibold">{formatNumber(row.original.stock)}</span>
        {row.original.stockStatus !== "in_stock" && (
          <StatusBadge domain="stock" status={row.original.stockStatus} />
        )}
      </span>
    ),
  },
  {
    id: "fitmentCount",
    accessorKey: "fitmentCount",
    meta: { label: "Fitment", align: "right" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fitment" />,
    cell: ({ row }) =>
      row.original.fitmentCount === 0 ? (
        <span className="font-medium text-warning-700">None</span>
      ) : (
        formatNumber(row.original.fitmentCount)
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
