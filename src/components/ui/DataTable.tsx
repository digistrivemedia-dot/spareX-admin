"use client"

import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useState, type ReactNode } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableEmpty } from "@/components/ui/DataTableEmpty"
import { DataTableGrid } from "@/components/ui/DataTableGrid"
import { DataTableMobileList } from "@/components/ui/DataTableMobileList"
import { DataTablePagination } from "@/components/ui/DataTablePagination"
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions"
import { ExportCsvButton, type ExportAction } from "@/components/ui/ExportCsvButton"
import type { Paginated } from "@/lib/types"
import { ListQueryProvider, useListQuery } from "@/lib/use-list-query"
import { cn } from "@/lib/utils"

declare module "@tanstack/react-table" {
  // Generic parameters must match TanStack's declaration even though this meta does not use them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Used in the column picker and as the label on mobile cards. */
    label?: string
    /** Right-aligns numbers and money. */
    align?: "right"
    /** The card title on mobile. */
    primary?: boolean
  }
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: Paginated<TData>
  getRowId: (row: TData) => string
  /** The list's `FilterBar`. */
  toolbar?: ReactNode
  exportAction?: ExportAction
  /** Shown above the table when rows are selected. Receives the selected rows. */
  bulkActions?: (rows: TData[], clearSelection: () => void) => ReactNode
  /** Shown when the list has no rows at all (not when filters hide every row). */
  emptyState?: ReactNode
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  return (
    <ListQueryProvider>
      <DataTableContent {...props} />
    </ListQueryProvider>
  )
}

function DataTableContent<TData>({
  columns,
  data,
  getRowId,
  toolbar,
  exportAction,
  bulkActions,
  emptyState,
}: DataTableProps<TData>) {
  const { isPending } = useListQuery()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // TanStack Table v8 returns functions React Compiler can't memoize; skipping compilation here is expected.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data.items,
    columns: bulkActions ? [selectColumn<TData>(), ...columns] : columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: data.total,
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
  })

  const selected = table.getSelectedRowModel().rows.map((row) => row.original)
  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">{toolbar}</div>
        <div className="flex shrink-0 gap-2">
          <DataTableViewOptions table={table} />
          {exportAction && <ExportCsvButton action={exportAction} />}
        </div>
      </div>

      {bulkActions && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-navy-50 px-4 py-2">
          <span className="text-sm font-medium text-navy-800">{selected.length} selected</span>
          {bulkActions(selected, () => setRowSelection({}))}
        </div>
      )}

      <div aria-busy={isPending} className={cn("transition-opacity", isPending && "opacity-60")}>
        {rows.length === 0 ? (
          <DataTableEmpty emptyState={emptyState} />
        ) : (
          <>
            <DataTableGrid table={table} />
            <DataTableMobileList rows={rows} />
          </>
        )}
      </div>

      <DataTablePagination page={data.page} pageSize={data.pageSize} total={data.total} />
    </div>
  )
}

/** The checkbox column added when a list has bulk actions. */
function selectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label="Select row"
      />
    ),
  }
}
