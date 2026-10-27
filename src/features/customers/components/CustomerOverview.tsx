import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { FormAlert } from "@/components/ui/FormAlert"
import type { CustomerDetail } from "@/features/customers/types"
import { formatDate, formatDateTime, formatPhone } from "@/lib/format"

/** Profile, addresses and anything about the account that needs attention. */
export function CustomerOverview({ customer }: { customer: CustomerDetail }) {
  return (
    <>
      {customer.status === "deletion_requested" && customer.deletionRequestedAt && (
        <FormAlert tone="warning">
          Asked for their account to be deleted on {formatDate(customer.deletionRequestedAt)}{" "}
          (DPDP). Check for open orders or refunds, then delete the account.
        </FormAlert>
      )}
      {customer.status === "inactive" && customer.deactivationReason && (
        <FormAlert tone="warning">Deactivated: {customer.deactivationReason}</FormAlert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Name", value: customer.name },
              { label: "Email", value: customer.email || "–" },
              { label: "Mobile", value: customer.phone ? formatPhone(customer.phone) : "–" },
              { label: "Joined", value: formatDate(customer.createdAt) },
              { label: "Last active", value: formatDateTime(customer.lastActiveAt) },
              { label: "City", value: customer.city || "–" },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No saved addresses.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {customer.addresses.map((address) => (
                <li key={address.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <p className="font-medium text-gray-900">
                    {address.label ?? "Address"}
                    {address.isDefault && (
                      <span className="ml-2 text-xs text-gray-500">Default</span>
                    )}
                  </p>
                  <p>{address.line1}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {address.city}, {address.state} {address.pincode}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
