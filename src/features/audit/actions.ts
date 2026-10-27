"use server"

import { listAllAuditEntries } from "@/features/audit/api"
import { AUDIT_CSV_COLUMNS, AUDIT_LOG_FILTERS } from "@/features/audit/utils"
import { exportCsv } from "@/lib/csv-export"
import { listParamsFromQuery } from "@/lib/list-params"

/** The export itself is recorded in the audit log, like every other export. */
export async function exportAuditLogAction(query: string) {
  const params = listParamsFromQuery(query, AUDIT_LOG_FILTERS)
  return exportCsv({
    entity: "admin_user",
    label: "Audit log",
    load: (token) => listAllAuditEntries(token, params),
    columns: AUDIT_CSV_COLUMNS,
  })
}
