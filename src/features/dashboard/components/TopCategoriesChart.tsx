"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { CategorySales } from "@/features/dashboard/types"
import { formatCompactPrice, formatPrice } from "@/lib/format"

const config = {
  revenue: { label: "Revenue", color: "var(--color-chart-1)" },
} satisfies ChartConfig

/** The best-selling top-level categories by revenue, incl. GST. */
export function TopCategoriesChart({ data }: { data: CategorySales[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={formatCompactPrice} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={136} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel valueFormatter={formatPrice} />}
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
