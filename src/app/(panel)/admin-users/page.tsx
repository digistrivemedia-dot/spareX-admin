import { Plus } from "lucide-react"
import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { adminUsersApi } from "@/features/admin-users/api"
import { AdminUserDialog } from "@/features/admin-users/components/AdminUserDialog"
import { AdminUsersTable } from "@/features/admin-users/components/AdminUsersTable"
import { ADMIN_USER_FILTERS } from "@/features/admin-users/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { parseListParams } from "@/lib/list-params"

export const metadata: Metadata = { title: "Admin users" }

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin-users">) {
  const session = await requirePermission("adminUsers.view")
  const params = parseListParams(await searchParams, {
    filterKeys: ADMIN_USER_FILTERS,
    defaultSort: { field: "name", direction: "asc" },
  })
  const data = await adminUsersApi.list(await requireToken(), params)
  const canManage = can(session, "adminUsers.manage")

  return (
    <Container>
      <PageHeader
        title="Admin users"
        description="Kannali staff who can sign in to this panel. What each one can do comes from their role."
        actions={
          canManage && (
            <AdminUserDialog
              trigger={
                <Button>
                  <Plus aria-hidden />
                  Invite admin
                </Button>
              }
            />
          )
        }
      />
      <AdminUsersTable
        data={data}
        currentUserId={session.user.id}
        canManage={canManage}
        canExport={can(session, "data.export")}
      />
    </Container>
  )
}
