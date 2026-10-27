import { ImageOff } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailList } from "@/components/ui/DetailList"
import { DocumentViewer } from "@/components/ui/DocumentViewer"
import { EmptyState } from "@/components/ui/EmptyState"
import { FormAlert } from "@/components/ui/FormAlert"
import { MapLink } from "@/components/ui/MapLink"
import { Thumbnail } from "@/components/ui/Thumbnail"
import type { BusinessApplication, BusinessDocumentType } from "@/features/businesses/types"
import { BUSINESS_TYPE_LABELS, CORRECTABLE_FIELDS } from "@/features/businesses/utils"
import { formatPhone } from "@/lib/format"
import { isValidGstin } from "@/lib/gst"

const DOCUMENT_LABELS: Record<BusinessDocumentType, string> = {
  gst_certificate: "GST certificate",
  pan_card: "PAN card",
  trade_licence: "Trade licence",
  shop_photo: "Shop photo",
}

/** Everything the reviewer checks: business details, location, documents and photos. */
export function ApplicationDetails({ application }: { application: BusinessApplication }) {
  const { address } = application
  const fieldLabel = (value: string) =>
    CORRECTABLE_FIELDS.find((field) => field.value === value)?.label ?? value

  return (
    <>
      {application.status === "sent_back" && (
        <FormAlert tone="warning">
          Sent back for: {application.sentBackFields.map(fieldLabel).join(", ")}. Note:{" "}
          {application.note}
        </FormAlert>
      )}
      {application.status === "rejected" && (
        <FormAlert tone="error">Rejected: {application.rejectionReason}</FormAlert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Business details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <DetailList
            items={[
              { label: "Type", value: BUSINESS_TYPE_LABELS[application.type] },
              {
                label: "GSTIN",
                value: isValidGstin(application.gstin) ? (
                  application.gstin
                ) : (
                  <span className="text-danger-700">{application.gstin} (format is not valid)</span>
                ),
              },
              { label: "PAN", value: application.pan },
              { label: "Contact", value: application.contactName },
              { label: "Mobile", value: formatPhone(application.phone) },
              { label: "Email", value: application.email },
              {
                label: "Address",
                value: `${address.line1}, ${address.line2 ? `${address.line2}, ` : ""}${address.city}, ${address.state} ${address.pincode}`,
              },
            ]}
          />
          <MapLink location={application.location} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentViewer
            documents={application.documents.map((document) => ({
              ...document,
              label: DOCUMENT_LABELS[document.type],
            }))}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Shop photos</CardTitle>
        </CardHeader>
        <CardContent>
          {application.photos.length === 0 ? (
            <EmptyState icon={ImageOff} title="No photos uploaded" className="py-6" />
          ) : (
            <div className="flex flex-wrap gap-3">
              {application.photos.map((photo, index) => (
                <Thumbnail key={photo} src={photo} alt={`Shop photo ${index + 1}`} size="md" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
