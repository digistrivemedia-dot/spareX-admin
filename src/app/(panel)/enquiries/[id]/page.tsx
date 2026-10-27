import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getEnquiry } from "@/features/enquiries/api"
import { EnquiryNotes } from "@/features/enquiries/components/EnquiryNotes"
import { EnquiryReplyForm } from "@/features/enquiries/components/EnquiryReplyForm"
import { EnquiryRequest } from "@/features/enquiries/components/EnquiryRequest"
import { EnquiryStatusMenu } from "@/features/enquiries/components/EnquiryStatusMenu"
import { ENQUIRY_KIND_LABELS } from "@/features/enquiries/utils"
import { formatAge, formatDateTime, formatPhone } from "@/lib/format"

export const metadata: Metadata = { title: "Enquiry" }

export default async function EnquiryPage({ params }: PageProps<"/enquiries/[id]">) {
  const { id } = await params
  const session = await requirePermission("enquiries.view")
  const token = await requireToken()
  const [enquiry, activity] = await Promise.all([
    getEnquiry(token, id),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { record: id },
    }),
  ])
  if (!enquiry) notFound()
  const canManage = can(session, "enquiries.manage")

  return (
    <Container>
      <DetailLayout
        back={{ href: "/enquiries", label: "Enquiries" }}
        title={`${enquiry.number}: ${ENQUIRY_KIND_LABELS[enquiry.kind]}`}
        status={<StatusBadge domain="enquiry" status={enquiry.status} />}
        facts={[
          {
            label: "From",
            value: enquiry.customerId ? (
              <Link
                href={`/customers/${enquiry.customerId}`}
                className="text-navy-700 hover:underline"
              >
                {enquiry.name}
              </Link>
            ) : (
              `${enquiry.name} (guest)`
            ),
          },
          { label: "Mobile", value: formatPhone(enquiry.phone) },
          { label: "Received", value: formatDateTime(enquiry.createdAt) },
          { label: "Age", value: formatAge(enquiry.createdAt) },
        ]}
        actions={canManage && <EnquiryStatusMenu id={enquiry.id} status={enquiry.status} />}
        activity={<ActivityTimeline items={toActivityItems(activity.items)} />}
      >
        <EnquiryRequest enquiry={enquiry} />
        <EnquiryReplyForm enquiry={enquiry} canManage={canManage} />
        <EnquiryNotes enquiryId={enquiry.id} notes={enquiry.notes} canManage={canManage} />
      </DetailLayout>
    </Container>
  )
}
