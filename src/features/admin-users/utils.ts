import type { FilterOption } from "@/components/ui/FilterSelect"
import type { AdminUserStatus } from "@/features/admin-users/types"
import { PERMISSIONS, ROLES, type Permission } from "@/features/auth/permissions"
import { humanize } from "@/lib/format"

export const ADMIN_USER_FILTERS = ["role", "status"] as const

export const ROLE_OPTIONS: FilterOption[] = Object.values(ROLES).map((role) => ({
  value: role.id,
  label: role.name,
}))

export const ADMIN_STATUS_OPTIONS: FilterOption[] = (
  ["active", "invited", "inactive"] satisfies AdminUserStatus[]
).map((value) => ({ value, label: humanize(value) }))

/** "creditNotes" → "Credit notes", "manage" → "Manage". */
const words = (value: string) => humanize(value.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase())

/** Permissions grouped by area ("orders.view" → Orders: View), in the order they are declared. */
export function permissionGroups(granted: readonly Permission[]) {
  const groups = new Map<string, { label: string; granted: boolean }[]>()
  for (const permission of PERMISSIONS) {
    const [area = permission, action = ""] = permission.split(".")
    const group = groups.get(words(area)) ?? []
    group.push({ label: words(action), granted: granted.includes(permission) })
    groups.set(words(area), group)
  }
  return [...groups].map(([area, actions]) => ({ area, actions }))
}
