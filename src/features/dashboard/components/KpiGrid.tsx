import {
  Ban,
  Bike,
  CalendarCheck,
  ClipboardList,
  Clock,
  IndianRupee,
  Package,
  ShoppingCart,
  Store,
  Users,
  Wrench,
} from "lucide-react"

import { StatCard } from "@/components/ui/StatCard"
import type { DashboardKpis } from "@/features/dashboard/types"
import { formatNumber, formatPrice } from "@/lib/format"

/** Tiles show whole rupees; exact amounts are on the orders and payments lists. */
const wholeRupees = (paise: number) => formatPrice(Math.round(paise / 100) * 100)

/** Platform totals and the last period's activity. Money is parts sales incl. GST. */
export function KpiGrid({ kpis, periodDays }: { kpis: DashboardKpis; periodDays: number }) {
  const period = `Last ${periodDays} days`
  const tiles = [
    {
      label: "Revenue, B2C",
      value: wholeRupees(kpis.revenueB2c),
      hint: `${period}, incl. GST`,
      icon: IndianRupee,
    },
    {
      label: "Revenue, B2B",
      value: wholeRupees(kpis.revenueB2b),
      hint: `${period}, incl. GST`,
      icon: IndianRupee,
    },
    {
      label: "Orders",
      value: formatNumber(kpis.orders),
      hint: period,
      icon: ShoppingCart,
      href: "/orders",
    },
    {
      label: "Pending payments",
      value: wholeRupees(kpis.pendingPaymentsAmount),
      hint: `${formatNumber(kpis.pendingPaymentsCount)} orders, excl. credit`,
      icon: Clock,
      href: "/payments",
    },
    {
      label: "Cancelled orders",
      value: formatNumber(kpis.cancelledOrders),
      hint: period,
      icon: Ban,
      href: "/orders?status=cancelled",
    },
    {
      label: "Bookings",
      value: formatNumber(kpis.bookings),
      hint: period,
      icon: CalendarCheck,
      href: "/bookings",
    },
    {
      label: "Active job cards",
      value: formatNumber(kpis.activeJobCards),
      hint: "In garages now",
      icon: ClipboardList,
      href: "/job-cards",
    },
    {
      label: "Garages live",
      value: formatNumber(kpis.garagesLive),
      hint: `of ${formatNumber(kpis.garagesTotal)} approved`,
      icon: Wrench,
      href: "/garages",
    },
    {
      label: "Customers",
      value: formatNumber(kpis.customers),
      hint: "Active accounts",
      icon: Users,
      href: "/customers",
    },
    {
      label: "B2B businesses",
      value: formatNumber(kpis.businesses),
      hint: "Verified",
      icon: Store,
      href: "/businesses",
    },
    {
      label: "Vehicles",
      value: formatNumber(kpis.vehicles),
      hint: "Registered",
      icon: Bike,
      href: "/vehicles",
    },
    {
      label: "Products",
      value: formatNumber(kpis.products),
      hint: "Active in the catalogue",
      icon: Package,
      href: "/products",
    },
  ]

  return (
    <section aria-labelledby="kpi-heading" className="flex flex-col gap-3">
      <h2 id="kpi-heading" className="text-lg font-semibold text-gray-900">
        At a glance
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {tiles.map((tile) => (
          <StatCard key={tile.label} {...tile} />
        ))}
      </div>
    </section>
  )
}
