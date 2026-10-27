import { z } from "zod"

import type { RoleId } from "@/features/auth/permissions"
import { email, indianMobile } from "@/lib/validation"

/** No custom permissions: what an admin can do comes only from their role. */
export const adminUserSchema = z.object({
  name: z.string().trim().min(2, "Enter the full name.").max(80),
  email,
  phone: indianMobile,
  roleId: z.enum(["super-admin", "admin"] satisfies RoleId[], "Choose a role."),
})

export type AdminUserValues = z.input<typeof adminUserSchema>
export type AdminUserInput = z.output<typeof adminUserSchema>
