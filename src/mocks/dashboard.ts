import "server-only"

import type { DashboardSummary } from "@/features/dashboard/types"
import type { OrderStatus } from "@/features/orders/types"
import { ORDER_FLOW, needsConfirmation } from "@/features/orders/utils"
import { bookings } from "@/mocks/bookings"
import { applications, businesses } from "@/mocks/businesses"
import { products } from "@/mocks/catalog"
import { creditAccounts } from "@/mocks/credit"
import { customers } from "@/mocks/customers"
import { enquiries } from "@/mocks/enquiries"
import { garages } from "@/mocks/garages"
import { jobCards } from "@/mocks/job-cards"
import { productCategories } from "@/mocks/masters"
import { orders } from "@/mocks/orders"
import { returns } from "@/mocks/returns"
import { dateOnly, daysAgo, delay } from "@/mocks/utils"
import { vehicles } from "@/mocks/vehicles"

const sum = <T>(rows: T[], value: (row: T) => number) =>
  rows.reduce((total, row) => total + value(row), 0)

/** Computed from the demo data the way the backend's dashboard endpoint will. */
export async function getDashboardSummary(periodDays: number): Promise<DashboardSummary> {
  await delay()
  const since = dateOnly(daysAgo(periodDays - 1))
  const recent = orders.filter((order) => dateOnly(order.placedAt) >= since)
  const sold = recent.filter((order) => order.status !== "cancelled")
  const unpaid = orders.filter(
    (order) =>
      order.status !== "cancelled" &&
      order.payment.method !== "credit" &&
      ["pending", "failed"].includes(order.payment.status),
  )
  const overdue = creditAccounts.filter((account) => account.status === "overdue")

  const salesByDay = Array.from({ length: periodDays }, (_, i) => {
    const date = dateOnly(daysAgo(periodDays - 1 - i))
    const day = sold.filter((order) => dateOnly(order.placedAt) === date)
    return {
      date,
      b2c: sum(
        day.filter((order) => order.channel === "b2c"),
        (order) => order.total,
      ),
      b2b: sum(
        day.filter((order) => order.channel === "b2b"),
        (order) => order.total,
      ),
    }
  })

  const statuses: OrderStatus[] = [...ORDER_FLOW, "cancelled"]
  const ordersByStatus = statuses.map((status) => ({
    status,
    count: recent.filter((order) => order.status === status).length,
  }))

  const revenueByCategory = new Map<string, number>()
  for (const item of sold.flatMap((order) => order.items)) {
    const categoryId = products.find((product) => product.id === item.productId)?.categoryId
    if (categoryId)
      revenueByCategory.set(categoryId, (revenueByCategory.get(categoryId) ?? 0) + item.total)
  }
  const topCategories = [...revenueByCategory]
    .map(([categoryId, revenue]) => ({
      categoryId,
      name: productCategories.find((category) => category.id === categoryId)?.name ?? categoryId,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    periodDays,
    attention: {
      applicationsWaiting: applications.filter((application) =>
        ["submitted", "under_review"].includes(application.status),
      ).length,
      returnsToApprove: returns.filter((item) => item.status === "requested").length,
      paymentsToConfirm: orders.filter(needsConfirmation).length,
      overdueCreditAccounts: overdue.length,
      overdueCreditAmount: sum(overdue, (account) => account.overdue),
      newEnquiries: enquiries.filter((enquiry) => enquiry.status === "new").length,
    },
    kpis: {
      customers: customers.filter((customer) => customer.status === "active").length,
      businesses: businesses.length,
      garagesLive: garages.filter((garage) => garage.status === "live").length,
      garagesTotal: garages.length,
      vehicles: vehicles.length,
      products: products.filter((product) => product.active).length,
      orders: recent.length,
      bookings: bookings.filter((booking) => dateOnly(booking.createdAt) >= since).length,
      activeJobCards: jobCards.filter((card) => !["delivered", "cancelled"].includes(card.status))
        .length,
      revenueB2c: sum(
        sold.filter((order) => order.channel === "b2c"),
        (order) => order.total,
      ),
      revenueB2b: sum(
        sold.filter((order) => order.channel === "b2b"),
        (order) => order.total,
      ),
      pendingPaymentsAmount: sum(unpaid, (order) => order.total),
      pendingPaymentsCount: unpaid.length,
      cancelledOrders: recent.filter((order) => order.status === "cancelled").length,
    },
    salesByDay,
    ordersByStatus,
    topCategories,
  }
}
