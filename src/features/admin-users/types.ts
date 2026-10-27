import type { RoleId } from "@/features/auth/permissions"
import type { IsoDateTime } from "@/lib/types"

export type AdminUserStatus = "active" | "inactive" | "invited"

export type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  roleId: RoleId
  status: AdminUserStatus
  twoStepEnabled: boolean
  lastLoginAt: IsoDateTime | null
  createdAt: IsoDateTime
}
