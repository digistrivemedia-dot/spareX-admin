"use client"

import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

/** The desktop table (from `md` up): sticky header, compact rows, right-aligned numbers. */
export function DataTableGrid<TData>({ table }: { table: TanStackTable<TData> }) {
  return (
    <Table
      // The table scrolls inside its card so the header can stay visible; 18rem leaves room for the
      // top bar, page header, toolbar and pagination.
      containerClassName="hidden max-h-[calc(100svh-18rem)] md:block"
    >
      <TableHeader className="sticky top-0 z-10 bg-gray-50">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className="hover:bg-transparent">
            {group.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(
                  "h-10 px-4 text-xs text-gray-500",
                  header.column.columnDef.meta?.align === "right" && "text-right",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
            className="h-12 hover:bg-gray-50"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  "px-4 text-gray-700",
                  cell.column.columnDef.meta?.align === "right" && "text-right tabular-nums",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
