"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Thumbnail } from "@/components/ui/Thumbnail"
import { deleteBannerAction } from "@/features/content/actions"
import { BannerDialog } from "@/features/content/components/BannerDialog"
import { DeleteButton } from "@/features/content/components/DeleteButton"
import type { Banner } from "@/features/content/types"
import { bannerState, PLACEMENT_LABELS } from "@/features/content/utils"
import { formatDate } from "@/lib/format"

export function bannerColumns(canManage: boolean): ColumnDef<Banner>[] {
  const columns: ColumnDef<Banner>[] = [
    {
      id: "title",
      meta: { label: "Banner", primary: true },
      enableHiding: false,
      enableSorting: false,
      header: "Banner",
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <Thumbnail src={row.original.webImageUrl} alt="" />
          <div className="flex min-w-0 flex-col">
            <span className="font-medium whitespace-normal text-gray-900">
              {row.original.title}
            </span>
            <span className="truncate text-xs text-gray-500">
              {row.original.linkUrl || "No link"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "placement",
      accessorKey: "placement",
      meta: { label: "Placement" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Placement" />,
      cell: ({ row }) => (
        <span className="flex flex-col whitespace-nowrap">
          {PLACEMENT_LABELS[row.original.placement]}
          <span className="text-xs text-gray-500">Position {row.original.sortOrder}</span>
        </span>
      ),
    },
    {
      id: "startsAt",
      accessorKey: "startsAt",
      meta: { label: "Schedule" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Schedule" />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.original.startsAt)} –{" "}
          {row.original.endsAt ? formatDate(row.original.endsAt) : "no end date"}
        </span>
      ),
    },
    {
      id: "state",
      meta: { label: "Status" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge domain="banner" status={bannerState(row.original)} />,
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
          <BannerDialog
            banner={row.original}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${row.original.title}`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <DeleteButton
            noun="banner"
            name={row.original.title}
            onConfirm={() => deleteBannerAction(row.original.id)}
          />
        </div>
      ),
    },
  ]
}
