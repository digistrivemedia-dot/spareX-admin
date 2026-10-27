"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { BUSINESS_TYPE_LABELS } from "@/features/businesses/utils"
import { DiscountDialog } from "@/features/pricing/components/DiscountDialog"
import type { PricingRow } from "@/features/pricing/types"
import { formatPercent } from "@/lib/format"

export function pricingColumns(canManage: boolean, withPreview: boolean): ColumnDef<PricingRow>[] {
  const columns: ColumnDef<PricingRow>[] = [
    {
      id: "name",
      accessorKey: "name",
      meta: { label: "Business", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Business" />,
      cell: ({ row }) => (
        <Link href={`/businesses/${row.original.businessId}`} className="flex flex-col">
          <span className="font-medium text-navy-700 hover:underline">{row.original.name}</span>
          <span className="text-xs text-gray-500">{BUSINESS_TYPE_LABELS[row.original.type]}</span>
        </Link>
      ),
    },
    {
      id: "status",
      meta: { label: "Account" },
      enableSorting: false,
      header: "Account",
      cell: ({ row }) => <StatusBadge domain="business" status={row.original.status} />,
    },
    {
      id: "discountPercent",
      accessorKey: "discountPercent",
      meta: { label: "Discount", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Discount" />,
      cell: ({ row }) => (
        <span className="font-semibold">{formatPercent(row.original.discountPercent)}</span>
      ),
    },
  ]
  if (withPreview) {
    columns.push({
      id: "b2bPrice",
      meta: { label: "B2B price (incl. GST)", align: "right" },
      enableSorting: false,
      header: "B2B price (incl. GST)",
      cell: ({ row }) =>
        row.original.preview ? <Price paise={row.original.preview.b2bPrice} /> : "–",
    })
  }
  if (!canManage) return columns
  return [
    ...columns,
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DiscountDialog
            businessIds={[row.original.businessId]}
            label={row.original.name}
            current={row.original.discountPercent}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit discount for ${row.original.name}`}
              >
                <Pencil aria-hidden />
              </Button>
            }
          />
        </div>
      ),
    },
  ]
}
