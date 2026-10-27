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
import { getBusiness } from "@/features/businesses/api"
import { BusinessActions } from "@/features/businesses/components/BusinessActions"
import { BusinessProfile } from "@/features/businesses/components/BusinessProfile"
import { BusinessRecords, type BusinessTab } from "@/features/businesses/components/BusinessRecords"
import { BusinessUsers } from "@/features/businesses/components/BusinessUsers"
import { formatPercent } from "@/lib/format"

export const metadata: Metadata = { title: "Business" }

const RECORD_TABS: BusinessTab[] = ["orders", "quotations", "returns"]

export default async function BusinessPage({
  params,
  searchParams,
}: PageProps<"/businesses/[id]">) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams])
  const session = await requirePermission("businesses.view")
  const token = await requireToken()
  const [business, activity] = await Promise.all([
    getBusiness(token, id),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { record: id },
    }),
  ])
  if (!business) notFound()

  const recordTab = RECORD_TABS.find((item) => item === tab)
  const activeTab = recordTab ?? (tab === "users" ? "users" : "profile")
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "users", label: "Users", count: business.users.length },
    { id: "orders", label: "Orders", count: business.orders.length },
    { id: "quotations", label: "Quotations", count: business.quotations.length },
    { id: "returns", label: "Returns", count: business.returns.length },
  ]

  return (
    <Container>
      <DetailLayout
        back={{ href: "/businesses", label: "Businesses" }}
        title={business.name}
        status={<StatusBadge domain="business" status={business.status} />}
        facts={[
          { label: "GSTIN", value: business.gstin },
          { label: "B2B discount", value: formatPercent(business.discountPercent) },
          {
            label: "Credit",
            value:
              business.creditStatus && business.creditAccountId ? (
                <Link
                  href={`/credit/${business.creditAccountId}`}
                  className="text-navy-700 hover:underline"
                >
                  <StatusBadge domain="credit" status={business.creditStatus} />
                </Link>
              ) : (
                "Off"
              ),
          },
          { label: "Orders", value: business.orderCount },
        ]}
        actions={
          <BusinessActions
            business={business}
            canManage={can(session, "businesses.manage")}
            canPrice={can(session, "pricing.manage")}
            canCredit={can(session, "credit.manage")}
          />
        }
        tabs={{ items: tabs, active: activeTab, basePath: `/businesses/${business.id}` }}
        activity={<ActivityTimeline items={toActivityItems(activity.items)} />}
      >
        {recordTab ? (
          <BusinessRecords business={business} tab={recordTab} />
        ) : activeTab === "users" ? (
          <BusinessUsers users={business.users} />
        ) : (
          <BusinessProfile business={business} />
        )}
      </DetailLayout>
    </Container>
  )
}
