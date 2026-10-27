import "server-only"

import { recordAudit } from "@/features/audit/api"
import type { AuditEntity } from "@/features/audit/types"
import { actorFrom, authorizeAction } from "@/features/auth/session"
import { failure } from "@/lib/action-result"
import { toCsv, type CsvColumn, type CsvFile } from "@/lib/csv"
import type { ActionResult } from "@/lib/types"

type ExportOptions<T> = {
  entity: AuditEntity
  /** Plural noun for the audit summary and file name, e.g. "Orders". */
  label: string
  /** Fixed columns, or worked out from the rows when they are only known after loading (reports). */
  columns: CsvColumn<T>[] | ((rows: T[]) => CsvColumn<T>[])
  /** Loads every row matching the current filters. Only called once the admin is allowed to export. */
  load: (token: string) => Promise<T[]>
}

/** Every list's "Export CSV" goes through here: it checks the permission and records the export. */
export async function exportCsv<T>({
  entity,
  label,
  columns,
  load,
}: ExportOptions<T>): Promise<ActionResult<CsvFile>> {
  const auth = await authorizeAction("data.export")
  if ("error" in auth) return { ok: false, error: auth.error }
  try {
    const rows = await load(auth.token)
    await recordAudit(auth.token, actorFrom(auth.session), {
      action: "export",
      entity,
      entityId: "",
      entityLabel: label,
      summary: `Exported ${label.toLowerCase()} to CSV (${rows.length} rows)`,
      changes: [],
    })
    const date = new Date().toISOString().slice(0, 10)
    const filename = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${date}.csv`
    const csvColumns = typeof columns === "function" ? columns(rows) : columns
    return { ok: true, data: { filename, content: toCsv(rows, csvColumns) } }
  } catch (error) {
    return failure(error)
  }
}
