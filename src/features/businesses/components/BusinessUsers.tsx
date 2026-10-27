import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { BusinessUser } from "@/features/businesses/types"
import { formatPhone, humanize } from "@/lib/format"

/** People who sign in to B2B for this business. They manage their own team on the B2B site. */
export function BusinessUsers({ users }: { users: BusinessUser[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Users</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {user.email} · {formatPhone(user.phone)}
                </p>
              </div>
              <span className="text-sm text-gray-700">{humanize(user.role)}</span>
              <StatusBadge domain="active" status={user.active ? "active" : "inactive"} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
