import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { requirePermission, requireToken } from "@/features/auth/session"
import { getJobCard } from "@/features/job-cards/api"
import { JobCardBilling } from "@/features/job-cards/components/JobCardBilling"
import { JobCardEstimate } from "@/features/job-cards/components/JobCardEstimate"
import { JobCardInspection } from "@/features/job-cards/components/JobCardInspection"

export const metadata: Metadata = { title: "Job card" }

const link = (href: string, text: string) => (
  <Link href={href} className="text-navy-700 hover:underline">
    {text}
  </Link>
)

/** Read only: garages run job cards on B2B. */
export default async function JobCardPage({ params }: PageProps<"/job-cards/[id]">) {
  const { id } = await params
  await requirePermission("jobCards.view")
  const card = await getJobCard(await requireToken(), id)
  if (!card) notFound()

  return (
    <Container>
      <DetailLayout
        back={{ href: "/job-cards", label: "Job cards" }}
        title={card.number}
        status={<StatusBadge domain="jobCard" status={card.status} />}
        facts={[
          { label: "Garage", value: link(`/garages/${card.garageId}`, card.garageName) },
          {
            label: "Vehicle",
            value: link(
              `/vehicles/${card.vehicleId}`,
              `${card.registrationNumber} · ${card.vehicleLabel}`,
            ),
          },
          {
            label: "Customer",
            value: card.customer
              ? link(`/customers/${card.customer.id}`, card.customer.name)
              : "Walk-in, not linked",
          },
          {
            label: "Booking",
            value: card.bookingId ? link(`/bookings/${card.bookingId}`, "Open booking") : "Walk-in",
          },
        ]}
      >
        <JobCardInspection card={card} />
        <JobCardEstimate items={card.estimate} />
        <JobCardBilling card={card} />
      </DetailLayout>
    </Container>
  )
}
