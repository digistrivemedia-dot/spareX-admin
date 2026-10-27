import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { GarageDetail } from "@/features/garages/types"
import { STAFF_ROLE_LABELS } from "@/features/garages/utils"
import { formatPhone } from "@/lib/format"

/** Staff with their B2B garage roles, and the garage's other branches. */
export function GarageTeam({ garage }: { garage: GarageDetail }) {
  return (
    <>
      <Card className="gap-0 py-0">
        <CardHeader className="border-b border-gray-200 py-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Staff</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y divide-gray-200">
            {garage.staff.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{formatPhone(member.phone)}</p>
                </div>
                <span className="text-sm text-gray-700">{STAFF_ROLE_LABELS[member.role]}</span>
                <StatusBadge domain="active" status={member.active ? "active" : "inactive"} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {garage.branches.length === 0 ? (
            <p className="text-sm text-gray-500">No other branches.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {garage.branches.map((branch) => (
                <li key={branch.id}>
                  <span className="font-medium text-gray-900">{branch.name}</span> ·{" "}
                  {branch.address.line1}, {branch.address.city}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
