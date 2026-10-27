import "server-only"

import type { AdminUserInput } from "@/features/admin-users/schemas"
import type { AdminUser } from "@/features/admin-users/types"
import { ROLES } from "@/features/auth/permissions"
import { ApiError } from "@/lib/api-client"
import type { ActorRef } from "@/lib/types"
import { adminUsers } from "@/mocks/admin-users"
import { diffChanges, recordAuditEntry } from "@/mocks/audit"
import { delay, listEndpoint, newId } from "@/mocks/utils"

export const adminUserEndpoint = listEndpoint<AdminUser>(() => adminUsers, {
  searchText: (row) => `${row.name} ${row.email} ${row.phone}`,
  date: (row) => row.createdAt,
  filters: {
    role: (row, value) => row.roleId === value,
    status: (row, value) => row.status === value,
  },
  sortValues: {
    name: (row) => row.name,
    lastLoginAt: (row) => row.lastLoginAt ?? "",
    createdAt: (row) => row.createdAt,
  },
})

export async function adminOptions(): Promise<{ id: string; name: string }[]> {
  return adminUsers.map(({ id, name }) => ({ id, name }))
}

function find(id: string): AdminUser {
  const user = adminUsers.find((candidate) => candidate.id === id)
  if (!user) throw new ApiError("Admin user not found.", 404)
  return user
}

/** At least one active Super Admin must remain, or no one could manage admins again. */
function assertSuperAdminRemains(user: AdminUser, change: Partial<AdminUser>) {
  const losesSuperAdmin =
    user.roleId === "super-admin" &&
    user.status === "active" &&
    (change.roleId === "admin" || change.status === "inactive")
  const others = adminUsers.filter(
    (other) => other.id !== user.id && other.roleId === "super-admin" && other.status === "active",
  )
  if (losesSuperAdmin && others.length === 0) {
    throw new ApiError("Keep at least one active Super Admin.", 409)
  }
}

/** New admins are invited by email and set their own password; Super Admins also set up 2-step on first sign-in. */
export async function saveAdminUser(actor: ActorRef, id: string | null, input: AdminUserInput) {
  await delay()
  if (adminUsers.some((other) => other.email === input.email && other.id !== id)) {
    throw new ApiError("Check the highlighted field.", 422, {
      email: ["Another admin already uses this email."],
    })
  }
  if (id) {
    const user = find(id)
    assertSuperAdminRemains(user, input)
    const before = { ...user, role: ROLES[user.roleId].name }
    Object.assign(user, input)
    recordAuditEntry(actor, {
      action: "update",
      entity: "admin_user",
      entityId: id,
      entityLabel: user.name,
      summary: "Edited admin user",
      changes: diffChanges(
        before,
        { ...user, role: ROLES[user.roleId].name },
        {
          name: "Name",
          email: "Email",
          phone: "Mobile",
          role: "Role",
        },
      ),
    })
    return
  }
  const user: AdminUser = {
    id: newId("adm"),
    ...input,
    status: "invited",
    twoStepEnabled: false,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  }
  adminUsers.push(user)
  recordAuditEntry(actor, {
    action: "create",
    entity: "admin_user",
    entityId: user.id,
    entityLabel: user.name,
    summary: `Invited ${user.email} as ${ROLES[user.roleId].name}`,
    changes: [],
  })
}

export async function setAdminUserActive(actor: ActorRef, id: string, active: boolean) {
  await delay()
  if (id === actor.id) throw new ApiError("You can't deactivate your own account.", 409)
  const user = find(id)
  const status = active ? "active" : "inactive"
  assertSuperAdminRemains(user, { status })
  const before = user.status
  user.status = status
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "admin_user",
    entityId: id,
    entityLabel: user.name,
    summary: active ? "Reactivated admin user" : "Deactivated admin user",
    changes: [{ field: "Status", before, after: status }],
  })
}
