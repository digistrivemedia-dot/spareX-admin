"use server"

import * as api from "@/features/admin-users/api"
import { adminUserSchema, type AdminUserValues } from "@/features/admin-users/schemas"
import { ADMIN_USER_FILTERS } from "@/features/admin-users/utils"
import { ROLES } from "@/features/auth/permissions"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, formatPhone, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runMutation, runValidatedMutation } from "@/lib/server-action"

export async function saveAdminUserAction(id: string | null, values: AdminUserValues) {
  return runValidatedMutation("adminUsers.manage", adminUserSchema, values, (context, data) =>
    api.saveAdminUser(context, id, data),
  )
}

export async function setAdminUserActiveAction(id: string, active: boolean) {
  return runMutation("adminUsers.manage", (context) => api.setAdminUserActive(context, id, active))
}

export async function exportAdminUsersAction(query: string) {
  const params = listParamsFromQuery(query, ADMIN_USER_FILTERS)
  return exportCsv({
    entity: "admin_user",
    label: "Admin users",
    load: (token) => api.adminUsersApi.all(token, params),
    columns: [
      { header: "Name", value: (row) => row.name },
      { header: "Email", value: (row) => row.email },
      { header: "Mobile", value: (row) => formatPhone(row.phone) },
      { header: "Role", value: (row) => ROLES[row.roleId].name },
      { header: "Status", value: (row) => humanize(row.status) },
      { header: "2-step", value: (row) => (row.twoStepEnabled ? "On" : "Off") },
      {
        header: "Last sign-in",
        value: (row) => (row.lastLoginAt ? formatDateTime(row.lastLoginAt) : ""),
      },
    ],
  })
}
