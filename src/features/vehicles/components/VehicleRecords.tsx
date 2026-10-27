import { Price } from "@/components/ui/Price"
import { RecordList, type RecordListItem } from "@/components/ui/RecordList"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { VehicleDetail } from "@/features/vehicles/types"
import { formatDate, formatNumber } from "@/lib/format"

export type VehicleTab = "owners" | "service" | "parts" | "invoices"

/** The vehicle's history from every garage: owners, visits, parts fitted and invoices. */
export function VehicleRecords({ vehicle, tab }: { vehicle: VehicleDetail; tab: VehicleTab }) {
  const lists: Record<VehicleTab, { title: string; empty: string; items: RecordListItem[] }> = {
    owners: {
      title: "Owners over time",
      empty: "Walk-in vehicle, not linked to a customer yet",
      items: vehicle.owners.toReversed().map((owner) => ({
        id: `${owner.customerId}-${owner.from}`,
        href: `/customers/${owner.customerId}`,
        title: owner.customerName,
        subtitle: `${formatDate(owner.from)} – ${owner.to ? formatDate(owner.to) : "now"}`,
        badge:
          owner.to === null ? (
            <StatusBadge domain="active" status="active" label="Current" />
          ) : undefined,
      })),
    },
    service: {
      title: "Service history",
      empty: "No visits to any garage yet",
      items: vehicle.serviceHistory.map((visit) => ({
        id: visit.jobCardId,
        href: `/job-cards/${visit.jobCardId}`,
        title: `${visit.garageName} · ${visit.jobCardNumber}`,
        subtitle: `${formatDate(visit.date)} · ${formatNumber(visit.odometerKm)} km${visit.work.length ? ` · ${visit.work.join(", ")}` : ""}`,
        badge: <StatusBadge domain="jobCard" status={visit.status} />,
        meta: visit.total !== null ? <Price paise={visit.total} /> : undefined,
      })),
    },
    parts: {
      title: "Parts installed",
      empty: "No parts fitted yet",
      items: vehicle.partsInstalled.map((part) => ({
        id: `${part.jobCardId}-${part.description}`,
        href: part.productId ? `/products/${part.productId}` : `/job-cards/${part.jobCardId}`,
        title: part.description,
        subtitle: `${part.garageName} · ${formatDate(part.date)} · qty ${part.quantity}`,
      })),
    },
    invoices: {
      title: "Service invoices",
      empty: "No invoices yet",
      items: vehicle.invoices.map((invoice) => ({
        id: invoice.number,
        href: `/job-cards/${invoice.jobCardId}`,
        title: invoice.number,
        subtitle: `${invoice.garageName} · ${formatDate(invoice.issuedAt)}`,
        meta: <Price paise={invoice.total} gst="incl" />,
      })),
    },
  }
  const list = lists[tab]
  return <RecordList title={list.title} items={list.items} emptyTitle={list.empty} />
}
