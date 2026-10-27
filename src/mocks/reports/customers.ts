import "server-only"

import type { Report, ReportColumn, ReportQuery } from "@/features/reports/types"
import { businesses } from "@/mocks/businesses"
import { customers } from "@/mocks/customers"
import { orders } from "@/mocks/orders"
import { breakdown, buildSeries, inRange, sum } from "@/mocks/reports/shared"

const CUSTOMER_COLUMNS: ReportColumn[] = [
  { key: "spend", label: "Lifetime spend (incl. GST)", format: "money" },
  { key: "orders", label: "Orders", format: "count" },
  { key: "periodSpend", label: "Spend in period", format: "money" },
]

const TYPE_COLUMNS: ReportColumn[] = [
  { key: "spend", label: "Lifetime spend (incl. GST)", format: "money" },
  { key: "accounts", label: "Accounts", format: "count" },
  { key: "active", label: "Active in period", format: "count" },
  { key: "repeat", label: "Repeat buyers", format: "count" },
]

/** B2C customers and B2B businesses as one list of accounts that buy parts. */
function accounts() {
  return [
    ...customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      type: "b2c" as const,
      joinedAt: customer.createdAt,
    })),
    ...businesses.map((business) => ({
      id: business.id,
      name: business.name,
      type: "b2b" as const,
      joinedAt: business.approvedAt,
    })),
  ]
}

/** A53: new, active and repeat customers, B2B and B2C, and lifetime spend. */
export function customerReport(query: ReportQuery): Report {
  const sold = orders.filter((order) => order.status !== "cancelled")
  const all = accounts().filter((account) => !query.channel || account.type === query.channel)
  const stats = all.map((account) => {
    const mine = sold.filter((order) => order.customer.id === account.id)
    const inPeriod = mine.filter((order) => inRange(order.placedAt, query))
    return {
      ...account,
      orders: mine.length,
      spend: sum(mine, (order) => order.total),
      periodSpend: sum(inPeriod, (order) => order.total),
      active: inPeriod.length > 0,
    }
  })
  const joined = stats.filter((account) => inRange(account.joinedAt, query))
  const label = { b2c: "B2C customers", b2b: "B2B businesses" }

  return {
    stats: [
      {
        label: "New accounts",
        value: joined.length,
        format: "count",
        hint: "Joined in the period",
      },
      {
        label: "Active",
        value: stats.filter((account) => account.active).length,
        format: "count",
        hint: "Ordered in the period",
      },
      {
        label: "Repeat buyers",
        value: stats.filter((account) => account.orders >= 2).length,
        format: "count",
        hint: "Two or more orders, ever",
      },
      { label: "Lifetime spend", value: sum(stats, (account) => account.spend), format: "money" },
    ],
    chartTitle: "New accounts by period",
    series: buildSeries(
      joined,
      query,
      (account) => account.joinedAt,
      [
        { key: "b2c", label: "B2C" },
        { key: "b2b", label: "B2B" },
      ],
      "count",
      (account) => ({ key: account.type, amount: 1 }),
    ),
    table:
      query.dimension === "type"
        ? {
            title: "B2C and B2B",
            columns: TYPE_COLUMNS,
            rows: breakdown(
              stats,
              (account) => ({ id: account.type, name: label[account.type] }),
              TYPE_COLUMNS,
              (account) => ({
                spend: account.spend,
                accounts: 1,
                active: account.active ? 1 : 0,
                repeat: account.orders >= 2 ? 1 : 0,
              }),
              query,
            ),
          }
        : {
            title: "Top customers by lifetime spend",
            columns: CUSTOMER_COLUMNS,
            rows: breakdown(
              stats.filter((account) => account.orders > 0),
              (account) => ({
                id: account.id,
                name: account.name,
                detail: account.type === "b2b" ? "B2B" : "B2C",
              }),
              CUSTOMER_COLUMNS,
              (account) => ({
                spend: account.spend,
                orders: account.orders,
                periodSpend: account.periodSpend,
              }),
              query,
            ).slice(0, 25),
          },
  }
}
