import { Check, Minus } from "lucide-react"
import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { permissionGroups } from "@/features/admin-users/utils"
import { ROLES } from "@/features/auth/permissions"
import { requirePermission } from "@/features/auth/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Roles" }

/** View only: roles are data, so new ones can be added later without code changes (Q-01, Q-17). */
export default async function RolesPage() {
  await requirePermission("roles.view")

  return (
    <Container>
      <PageHeader
        title="Roles"
        description="Two roles at launch. Every menu item, button and action checks one of these permissions."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {Object.values(ROLES).map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">{role.name}</CardTitle>
              <p className="text-sm text-gray-500">
                {role.description} 2-step verification is{" "}
                {role.twoStepRequired ? "required" : "optional"}.
              </p>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {permissionGroups(role.permissions).map((group) => (
                  <div key={group.area} className="flex flex-col gap-1">
                    <dt className="text-sm font-medium text-gray-900">{group.area}</dt>
                    <dd className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {group.actions.map((action) => (
                        <span
                          key={action.label}
                          className={cn(
                            "flex items-center gap-1",
                            action.granted ? "text-success-700" : "text-gray-400 line-through",
                          )}
                        >
                          {action.granted ? (
                            <Check aria-hidden className="size-4" />
                          ) : (
                            <Minus aria-hidden className="size-4" />
                          )}
                          {action.label}
                          <span className="sr-only">
                            {action.granted ? "(allowed)" : "(not allowed)"}
                          </span>
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  )
}
