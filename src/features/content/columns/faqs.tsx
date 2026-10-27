"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { deleteFaqAction } from "@/features/content/actions"
import { DeleteButton } from "@/features/content/components/DeleteButton"
import { FaqDialog } from "@/features/content/components/FaqDialog"
import type { Faq } from "@/features/content/types"
import { humanize } from "@/lib/format"

export function faqColumns(canManage: boolean): ColumnDef<Faq>[] {
  const columns: ColumnDef<Faq>[] = [
    {
      id: "sortOrder",
      accessorKey: "sortOrder",
      meta: { label: "Order", align: "right" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.sortOrder}</span>,
    },
    {
      id: "question",
      accessorKey: "question",
      meta: { label: "Question", primary: true },
      enableHiding: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Question" />,
      cell: ({ row }) => (
        <span className="flex max-w-xl flex-col gap-1 whitespace-normal">
          <span className="font-medium text-gray-900">{row.original.question}</span>
          <span className="line-clamp-2 text-xs text-gray-500">{row.original.answer}</span>
        </span>
      ),
    },
    {
      id: "category",
      meta: { label: "Category" },
      enableSorting: false,
      header: "Category",
      cell: ({ row }) => humanize(row.original.category),
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
          <FaqDialog
            faq={row.original}
            nextOrder={row.original.sortOrder}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit "${row.original.question}"`}>
                <Pencil aria-hidden />
              </Button>
            }
          />
          <DeleteButton
            noun="FAQ"
            name={row.original.question}
            onConfirm={() => deleteFaqAction(row.original.id)}
          />
        </div>
      ),
    },
  ]
}
