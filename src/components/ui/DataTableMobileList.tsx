"use client"

import { flexRender, type Cell, type Row } from "@tanstack/react-table"

/** Below the `md` breakpoint each row becomes a card: the primary column as its title, the rest as label / value. */
export function DataTableMobileList<TData>({ rows }: { rows: Row<TData>[] }) {
  return (
    <ul className="divide-y divide-gray-200 md:hidden">
      {rows.map((row) => {
        const cells = row.getVisibleCells()
        const primary =
          cells.find((cell) => cell.column.columnDef.meta?.primary) ?? cells.find(isDataCell)
        const actions = cells.find((cell) => cell.column.id === "actions")
        const select = cells.find((cell) => cell.column.id === "select")
        const details = cells.filter((cell) => cell !== primary && isDataCell(cell))
        return (
          <li key={row.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              {select && flexRender(select.column.columnDef.cell, select.getContext())}
              <div className="min-w-0 flex-1 font-medium text-gray-900">
                {primary && flexRender(primary.column.columnDef.cell, primary.getContext())}
              </div>
              {actions && flexRender(actions.column.columnDef.cell, actions.getContext())}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {details.map((cell) => (
                <div key={cell.id} className="min-w-0">
                  <dt className="text-xs text-gray-500">
                    {cell.column.columnDef.meta?.label ?? cell.column.id}
                  </dt>
                  <dd className="text-sm break-words text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        )
      })}
    </ul>
  )
}

function isDataCell<TData>(cell: Cell<TData, unknown>): boolean {
  return cell.column.id !== "actions" && cell.column.id !== "select"
}
