import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getGarage } from "@/features/garages/api"
import { GarageLiveActions } from "@/features/garages/components/GarageLiveActions"
import { GarageProfile } from "@/features/garages/components/GarageProfile"
import { GarageReadinessCard } from "@/features/garages/components/GarageReadinessCard"
import { GarageRecords, type GarageTab } from "@/features/garages/components/GarageRecords"
import { GarageServices } from "@/features/garages/components/GarageServices"
import { GarageTeam } from "@/features/garages/components/GarageTeam"

export const metadata: Metadata = { title: "Garage" }

const RECORD_TABS: GarageTab[] = ["bookings", "jobCards", "ratings"]

export default async function GaragePage({ params, searchParams }: PageProps<"/garages/[id]">) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams])
  const session = await requirePermission("garages.view")
  const token = await requireToken()
  const [garage, activity] = await Promise.all([
    getGarage(token, id),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { record: id },
    }),
  ])
  if (!garage) notFound()

  const recordTab = RECORD_TABS.find((item) => item === tab)
  const activeTab = recordTab ?? (tab === "services" || tab === "team" ? tab : "profile")
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "services", label: "Services", count: garage.services.length },
    { id: "team", label: "Staff and branches", count: garage.staff.length },
    { id: "bookings", label: "Bookings", count: garage.bookings.length },
    { id: "jobCards", label: "Job cards", count: garage.jobCards.length },
    { id: "ratings", label: "Ratings", count: garage.reviews.length },
  ]

  return (
    <Container>
      <DetailLayout
        back={{ href: "/garages", label: "Garages" }}
        title={garage.name}
        status={<StatusBadge domain="garage" status={garage.status} />}
        facts={[
          {
            label: "Ownership",
            value: garage.ownership === "kannali" ? "Kannali-owned" : "Partner",
          },
          { label: "City", value: garage.city },
          {
            label: "Rating",
            value: garage.ratingCount
              ? `${garage.rating.toFixed(1)} (${garage.ratingCount})`
              : "No ratings",
          },
          { label: "Services", value: garage.serviceCount },
        ]}
        actions={can(session, "garages.manage") && <GarageLiveActions garage={garage} />}
        tabs={{ items: tabs, active: activeTab, basePath: `/garages/${garage.id}` }}
        activity={
          <div className="flex flex-col gap-6">
            <GarageReadinessCard readiness={garage.readiness} />
            <ActivityTimeline items={toActivityItems(activity.items)} />
          </div>
        }
      >
        {recordTab ? (
          <GarageRecords garage={garage} tab={recordTab} />
        ) : activeTab === "services" ? (
          <GarageServices services={garage.services} />
        ) : activeTab === "team" ? (
          <GarageTeam garage={garage} />
        ) : (
          <GarageProfile garage={garage} />
        )}
      </DetailLayout>
    </Container>
  )
}
