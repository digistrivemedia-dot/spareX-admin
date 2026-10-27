"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { RatingStars } from "@/components/ui/RatingStars"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ReviewModeration } from "@/features/reviews/components/ReviewModeration"
import type { GarageReview, ProductReview, ReviewKind } from "@/features/reviews/types"
import { formatDateTime } from "@/lib/format"

type Review = GarageReview | ProductReview

/** The columns both review lists share: rating, comment, status, date and moderation. */
function sharedColumns<T extends Review>(kind: ReviewKind, canManage: boolean): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = [
    {
      id: "rating",
      accessorKey: "rating",
      meta: { label: "Rating" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    {
      id: "comment",
      meta: { label: "Review" },
      enableSorting: false,
      header: "Review",
      cell: ({ row }) => (
        <span className="flex max-w-md flex-col gap-1 whitespace-normal">
          {"title" in row.original && (
            <span className="font-medium text-gray-900">{row.original.title}</span>
          )}
          {row.original.comment}
          <span className="text-xs text-gray-500">
            {row.original.customerName} · {formatDateTime(row.original.createdAt)}
          </span>
          {row.original.hiddenReason && (
            <span className="text-xs text-danger-700">Hidden: {row.original.hiddenReason}</span>
          )}
        </span>
      ),
    },
    {
      id: "status",
      meta: { label: "Status" },
      enableSorting: false,
      header: "Status",
      cell: ({ row }) => <StatusBadge domain="review" status={row.original.status} />,
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
        <ReviewModeration
          kind={kind}
          id={row.original.id}
          status={row.original.status}
          author={row.original.customerName}
        />
      ),
    },
  ]
}

export function garageReviewColumns(canManage: boolean): ColumnDef<GarageReview>[] {
  return [
    {
      id: "garageName",
      meta: { label: "Garage", primary: true },
      enableHiding: false,
      enableSorting: false,
      header: "Garage",
      cell: ({ row }) => (
        <Link
          href={`/garages/${row.original.garageId}`}
          className="font-medium text-navy-700 hover:underline"
        >
          {row.original.garageName}
        </Link>
      ),
    },
    ...sharedColumns<GarageReview>("garage", canManage),
  ]
}

export function productReviewColumns(canManage: boolean): ColumnDef<ProductReview>[] {
  return [
    {
      id: "productName",
      meta: { label: "Product", primary: true },
      enableHiding: false,
      enableSorting: false,
      header: "Product",
      cell: ({ row }) => (
        <Link
          href={`/products/${row.original.productId}`}
          className="font-medium text-navy-700 hover:underline"
        >
          {row.original.productName}
        </Link>
      ),
    },
    ...sharedColumns<ProductReview>("product", canManage),
  ]
}
