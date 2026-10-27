import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ImportRowResult } from "@/features/catalog/types"

const ACTION_LABELS: Record<ImportRowResult["action"], string> = {
  create: "New product",
  update: "Update",
  add_fitment: "Add fitment",
}

/** Each CSV row as the server read it; rows with errors are skipped on import. */
export function ImportPreviewTable({ rows }: { rows: ImportRowResult[] }) {
  return (
    <Table
      // Long files scroll inside the card instead of pushing the import button off screen.
      containerClassName="max-h-[60svh] rounded-lg border border-gray-200"
    >
      <TableHeader className="sticky top-0 bg-gray-50">
        <TableRow>
          <TableHead className="w-14 text-right">Row</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Result</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.row} className={row.errors.length ? "bg-danger-50/50" : undefined}>
            <TableCell className="text-right tabular-nums">{row.row}</TableCell>
            <TableCell className="font-medium">{row.sku || "–"}</TableCell>
            <TableCell>
              {row.errors.length ? (
                <StatusBadge domain="approval" status="rejected" label="Skipped" />
              ) : (
                <StatusBadge
                  domain="approval"
                  status="approved"
                  label={ACTION_LABELS[row.action]}
                />
              )}
            </TableCell>
            <TableCell className="whitespace-normal">
              {row.errors.length ? (
                <ul className="list-disc pl-4 text-danger-700">
                  {row.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : (
                row.summary
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
