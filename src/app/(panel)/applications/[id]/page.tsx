import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getApplication } from "@/features/businesses/api"
import { ApplicationActions } from "@/features/businesses/components/ApplicationActions"
import { ApplicationDetails } from "@/features/businesses/components/ApplicationDetails"
import { BUSINESS_TYPE_LABELS } from "@/features/businesses/utils"
import { formatAge, formatDate, humanize } from "@/lib/format"

export const metadata: Metadata = { title: "Application review" }

export default async function ApplicationPage({ params }: PageProps<"/applications/[id]">) {
  const { id } = await params
  const session = await requirePermission("businesses.view")
  const application = await getApplication(await requireToken(), id)
  if (!application) notFound()

  const history = application.history.toReversed().map((event, index) => ({
    id: `${event.status}-${index}`,
    at: event.at,
    actor: event.by,
    title: humanize(event.status),
    detail: event.note,
  }))

  return (
    <Container>
      <DetailLayout
        back={{ href: "/applications", label: "Applications" }}
        title={application.businessName}
        status={<StatusBadge domain="application" status={application.status} />}
        facts={[
          { label: "Application", value: application.number },
          { label: "Type", value: BUSINESS_TYPE_LABELS[application.type] },
          { label: "Submitted", value: formatDate(application.submittedAt) },
          { label: "Age", value: formatAge(application.submittedAt) },
        ]}
        actions={
          can(session, "businesses.manage") && <ApplicationActions application={application} />
        }
        activity={<ActivityTimeline title="History" items={history} />}
      >
        <ApplicationDetails application={application} />
      </DetailLayout>
    </Container>
  )
}
