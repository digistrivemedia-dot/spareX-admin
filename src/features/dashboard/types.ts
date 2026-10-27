import type { OrderStatus } from "@/features/orders/types"
import type { IsoDate, Paise } from "@/lib/types"

/** Work waiting for an admin; shown first on the dashboard. */
export type AttentionCounts = {
  applicationsWaiting: number
  returnsToApprove: number
  /** Bank transfer, cash and collected COD payments an admin must mark paid. */
  paymentsToConfirm: number
  overdueCreditAccounts: number
  overdueCreditAmount: Paise
  newEnquiries: number
}

/** Totals now, plus activity in the last `periodDays`. Revenue is parts sales incl. GST, excluding cancelled orders. */
export type DashboardKpis = {
  customers: number
  businesses: number
  garagesLive: number
  garagesTotal: number
  vehicles: number
  products: number
  orders: number
  bookings: number
  activeJobCards: number
  revenueB2c: Paise
  revenueB2b: Paise
  pendingPaymentsAmount: Paise
  pendingPaymentsCount: number
  cancelledOrders: number
}

export type DailySales = { date: IsoDate; b2c: Paise; b2b: Paise }

export type OrderStatusCount = { status: OrderStatus; count: number }

export type CategorySales = { categoryId: string; name: string; revenue: Paise }

export type DashboardSummary = {
  periodDays: number
  attention: AttentionCounts
  kpis: DashboardKpis
  salesByDay: DailySales[]
  ordersByStatus: OrderStatusCount[]
  topCategories: CategorySales[]
}
