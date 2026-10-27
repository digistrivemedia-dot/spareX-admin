/**
 * Every menu item, button, route and server action is controlled by a permission, never by a role name, so new
 * roles can be added later as data. This file is safe to import from client components.
 */

export const PERMISSIONS = [
  "dashboard.view",
  "customers.view",
  "customers.manage",
  "vehicles.view",
  "vehicles.manage",
  "businesses.view",
  "businesses.manage",
  "credit.view",
  "credit.manage",
  "garages.view",
  "garages.manage",
  "masters.view",
  "masters.manage",
  "catalog.view",
  "catalog.manage",
  "stock.view",
  "stock.manage",
  "pricing.view",
  "pricing.manage",
  "orders.view",
  "orders.manage",
  "returns.view",
  "returns.manage",
  "payments.view",
  "payments.manage",
  "creditNotes.view",
  "creditNotes.manage",
  "quotations.view",
  "quotations.manage",
  "bookings.view",
  "bookings.manage",
  "jobCards.view",
  "payouts.view",
  "payouts.manage",
  "content.view",
  "content.manage",
  "coupons.view",
  "coupons.manage",
  "enquiries.view",
  "enquiries.manage",
  "reviews.view",
  "reviews.manage",
  "reports.view",
  "data.export",
  "auditLog.view",
  "adminUsers.view",
  "adminUsers.manage",
  "roles.view",
  "settings.view",
  "settings.manage",
  "integrations.view",
  "integrations.manage",
] as const

export type Permission = (typeof PERMISSIONS)[number]

export type RoleId = "super-admin" | "admin"

export type Role = {
  id: RoleId
  name: string
  description: string
  /** Super Admins must use 2-step verification; for other roles it is optional. */
  twoStepRequired: boolean
  permissions: readonly Permission[]
}

/** Admin has everything except admin users, roles, settings and integrations. Default for Q-01. */
const SUPER_ADMIN_ONLY: readonly Permission[] = [
  "adminUsers.view",
  "adminUsers.manage",
  "roles.view",
  "settings.view",
  "settings.manage",
  "integrations.view",
  "integrations.manage",
]

export const ROLES: Record<RoleId, Role> = {
  "super-admin": {
    id: "super-admin",
    name: "Super Admin",
    description: "Full control of the platform, including admin users, settings and integrations.",
    twoStepRequired: true,
    permissions: PERMISSIONS,
  },
  admin: {
    id: "admin",
    name: "Admin",
    description:
      "Runs day-to-day operations. Cannot manage admin users, roles, settings or integrations.",
    twoStepRequired: false,
    permissions: PERMISSIONS.filter((permission) => !SUPER_ADMIN_ONLY.includes(permission)),
  },
}

/** The single permission check used everywhere. */
export function can(
  session: { permissions: readonly Permission[] } | null,
  permission: Permission,
): boolean {
  return session?.permissions.includes(permission) ?? false
}
