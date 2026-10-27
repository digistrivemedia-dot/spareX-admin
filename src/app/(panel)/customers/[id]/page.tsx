import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityTimeline } from "@/components/layout/ActivityTimeline"
import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Price } from "@/components/ui/Price"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { listAuditEntries } from "@/features/audit/api"
import { toActivityItems } from "@/features/audit/utils"
import { can } from "@/features/auth/permissions"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getCustomer } from "@/features/customers/api"
import { CustomerOverview } from "@/features/customers/components/CustomerOverview"
import { CustomerRecords, type CustomerTab } from "@/features/customers/components/CustomerRecords"
import { CustomerStatusActions } from "@/features/customers/components/CustomerStatusActions"
import { formatDate, formatPhone } from "@/lib/format"

export const metadata: Metadata = { title: "Customer" }

const RECORD_TABS: CustomerTab[] = ["vehicles", "orders", "returns", "bookings", "enquiries"]

export default async function CustomerPage({ params, searchParams }: PageProps<"/customers/[id]">) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams])
  const session = await requirePermission("customers.view")
  const token = await requireToken()
  const [customer, activity] = await Promise.all([
    getCustomer(token, id),
    listAuditEntries(token, {
      page: 1,
      pageSize: 20,
      sort: { field: "at", direction: "desc" },
      filters: { record: id },
    }),
  ])
  if (!customer) notFound()

  const activeTab = RECORD_TABS.find((item) => item === tab) ?? "overview"
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "vehicles", label: "Vehicles", count: customer.vehicles.length },
    { id: "orders", label: "Orders", count: customer.orders.length },
    { id: "returns", label: "Returns", count: customer.returns.length },
    { id: "bookings", label: "Bookings", count: customer.bookings.length },
    { id: "enquiries", label: "Enquiries", count: customer.enquiries.length },
  ]

  return (
    <Container>
      <DetailLayout
        back={{ href: "/customers", label: "Customers" }}
        title={customer.name}
        status={<StatusBadge domain="customer" status={customer.status} />}
        facts={[
          { label: "Mobile", value: customer.phone ? formatPhone(customer.phone) : "–" },
          { label: "Joined", value: formatDate(customer.createdAt) },
          { label: "Orders", value: customer.orderCount },
          { label: "Total spend", value: <Price paise={customer.totalSpend} gst="incl" /> },
        ]}
        actions={
          can(session, "customers.manage") && (
            <CustomerStatusActions id={customer.id} name={customer.name} status={customer.status} />
          )
        }
        tabs={{ items: tabs, active: activeTab, basePath: `/customers/${customer.id}` }}
        activity={<ActivityTimeline items={toActivityItems(activity.items)} />}
      >
        {activeTab === "overview" ? (
          <CustomerOverview customer={customer} />
        ) : (
          <CustomerRecords customer={customer} tab={activeTab} />
        )}
      </DetailLayout>
    </Container>
  )
}
