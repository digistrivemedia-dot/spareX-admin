import "server-only"

import type { Order } from "@/features/orders/types"
import { CHANNEL_LABELS } from "@/features/orders/utils"
import type { Report, ReportColumn, ReportQuery } from "@/features/reports/types"
import { products } from "@/mocks/catalog"
import { partBrands, productCategories } from "@/mocks/masters"
import { orders } from "@/mocks/orders"
import { breakdown, buildSeries, inRange, sum, withShare } from "@/mocks/reports/shared"

const COLUMNS: ReportColumn[] = [
  { key: "revenue", label: "Revenue (incl. GST)", format: "money" },
  { key: "units", label: "Units", format: "count" },
  { key: "orders", label: "Order lines", format: "count" },
  { key: "share", label: "Share", format: "percent" },
]

const TITLES: Record<string, string> = {
  category: "Sales by category",
  brand: "Sales by part brand",
  product: "Sales by product",
  channel: "Sales by channel",
}

/** A51: parts sales, daily to yearly, by product, brand, category and channel. */
export function salesReport(query: ReportQuery): Report {
  const sold = orders.filter(
    (order) =>
      order.status !== "cancelled" &&
      inRange(order.placedAt, query) &&
      (!query.channel || order.channel === query.channel),
  )
  const lines = sold.flatMap((order) => order.items.map((item) => ({ order, item })))
  const revenue = sum(sold, (order) => order.total)

  const group = ({ order, item }: (typeof lines)[number]) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    if (query.dimension === "channel") {
      return { id: order.channel, name: CHANNEL_LABELS[order.channel] }
    }
    if (query.dimension === "product")
      return { id: item.productId, name: item.name, detail: item.sku }
    if (query.dimension === "brand") {
      const brand = partBrands.find((candidate) => candidate.id === product?.partBrandId)
      return brand ? { id: brand.id, name: brand.name } : null
    }
    const category = productCategories.find((candidate) => candidate.id === product?.categoryId)
    return category ? { id: category.id, name: category.name } : null
  }

  return {
    stats: [
      { label: "Revenue", value: revenue, format: "money", hint: "Incl. GST" },
      { label: "Orders", value: sold.length, format: "count" },
      {
        label: "Average order",
        value: sold.length ? Math.round(revenue / sold.length) : 0,
        format: "money",
      },
      { label: "GST collected", value: sum(sold, (order) => order.gstAmount), format: "money" },
    ],
    chartTitle: "Sales by period",
    series: buildSeries<Order>(
      sold,
      query,
      (order) => order.placedAt,
      [
        { key: "b2c", label: "B2C" },
        { key: "b2b", label: "B2B" },
      ],
      "money",
      (order) => ({ key: order.channel, amount: order.total }),
    ),
    table: {
      title: TITLES[query.dimension] ?? "Sales",
      description: "Item totals, before delivery charges and order discounts.",
      columns: COLUMNS,
      rows: withShare(
        breakdown(
          lines,
          group,
          COLUMNS,
          ({ item }) => ({ revenue: item.total, units: item.quantity, orders: 1 }),
          query,
        ),
        "revenue",
      ),
    },
  }
}
