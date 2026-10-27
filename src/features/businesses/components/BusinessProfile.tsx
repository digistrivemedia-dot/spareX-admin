import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { FormAlert } from "@/components/ui/FormAlert"
import { MapLink } from "@/components/ui/MapLink"
import type { BusinessDetail } from "@/features/businesses/types"
import { BUSINESS_TYPE_LABELS } from "@/features/businesses/utils"
import { formatDate, formatPhone } from "@/lib/format"
import type { Address } from "@/lib/types"

const oneLine = (address: Address) =>
  [address.line1, address.line2, `${address.city}, ${address.state} ${address.pincode}`]
    .filter(Boolean)
    .join(", ")

/** Registration details, location and branches. */
export function BusinessProfile({ business }: { business: BusinessDetail }) {
  return (
    <>
      {business.status === "on_hold" && (
        <FormAlert tone="warning">On hold: {business.holdReason}</FormAlert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <DetailList
            items={[
              { label: "Type", value: BUSINESS_TYPE_LABELS[business.type] },
              { label: "GSTIN", value: business.gstin },
              { label: "PAN", value: business.pan },
              { label: "Owner", value: business.ownerName },
              { label: "Mobile", value: formatPhone(business.phone) },
              { label: "Email", value: business.email },
              { label: "Address", value: oneLine(business.address) },
              { label: "Verified on", value: formatDate(business.approvedAt) },
            ]}
          />
          <MapLink location={business.location} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {business.branches.length === 0 ? (
            <p className="text-sm text-gray-500">No other branches.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {business.branches.map((branch) => (
                <li key={branch.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <p className="font-medium text-gray-900">{branch.name}</p>
                  <p>{oneLine(branch.address)}</p>
                  <p className="text-xs text-gray-500">
                    GSTIN: {branch.gstin ?? "Same as head office"}
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
