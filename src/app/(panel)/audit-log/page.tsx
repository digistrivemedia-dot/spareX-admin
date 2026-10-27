import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { getAdminOptions } from "@/features/admin-users/api"
import { listAuditEntries } from "@/features/audit/api"
import { AuditLogTable } from "@/features/audit/components/AuditLogTable"
import { AUDIT_LOG_FILTERS } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Audit log" }

export default async function AuditLogPage({ searchParams }: PageProps<"/audit-log">) {
  const session = await requirePermission("auditLog.view")
  const params = parseListParams(await searchParams, {
    filterKeys: AUDIT_LOG_FILTERS,
    defaultSort: { field: "at", direction: "desc" },
  })
  const token = await requireToken()
  const [data, admins] = await Promise.all([
    listAuditEntries(token, params),
    getAdminOptions(token),
  ])

  return (
    <Container>
      <PageHeader
        title="Audit log"
        description="Who changed what and when, with before and after values. Exports are recorded too."
      />
      <AuditLogTable
        data={data}
        adminOptions={admins.map(({ id, name }) => ({ value: id, label: name }))}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
