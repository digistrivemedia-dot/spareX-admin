"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"

import { FormDialog } from "@/components/ui/FormDialog"
import { SelectField } from "@/components/ui/SelectField"
import { TextField } from "@/components/ui/TextField"
import { saveAdminUserAction } from "@/features/admin-users/actions"
import { adminUserSchema, type AdminUserValues } from "@/features/admin-users/schemas"
import type { AdminUser } from "@/features/admin-users/types"
import { ROLE_OPTIONS } from "@/features/admin-users/utils"
import { formatPhone } from "@/lib/format"

/** Invite a new admin by email, or edit one. Permissions come only from the role. */
export function AdminUserDialog({ user, trigger }: { user?: AdminUser; trigger: ReactNode }) {
  const values: AdminUserValues = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user ? formatPhone(user.phone) : "",
    roleId: user?.roleId ?? "admin",
  }
  const form = useForm({ resolver: zodResolver(adminUserSchema), values })

  return (
    <FormDialog
      trigger={trigger}
      title={user ? `Edit ${user.name}` : "Invite admin"}
      description={
        user
          ? undefined
          : "They get an email to set their password. Super Admins also set up 2-step verification."
      }
      form={form}
      action={(data) => saveAdminUserAction(user?.id ?? null, data)}
      successMessage={user ? "Admin user saved" : "Invitation sent"}
      submitLabel={user ? "Save" : "Send invitation"}
    >
      <TextField control={form.control} name="name" label="Full name" />
      <TextField control={form.control} name="email" label="Email" type="email" />
      <TextField control={form.control} name="phone" label="Mobile" inputMode="tel" />
      <SelectField
        control={form.control}
        name="roleId"
        label="Role"
        options={ROLE_OPTIONS}
        description="See Roles for what each role can do."
      />
    </FormDialog>
  )
}
