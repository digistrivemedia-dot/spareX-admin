"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DailySales } from "@/features/dashboard/types"
import { formatCompactPrice, formatDate, formatPrice } from "@/lib/format"

const config = {
  b2c: { label: "B2C", color: "var(--color-chart-1)" },
  b2b: { label: "B2B", color: "var(--color-chart-2)" },
} satisfies ChartConfig

const shortDate = (date: string) => formatDate(date).replace(/ \d{4}$/, "")

/** Daily parts sales, B2C and B2B stacked. */
export function SalesChart({ data }: { data: DailySales[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={shortDate}
        />
        <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={formatCompactPrice} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => formatDate(String(payload[0]?.payload.date ?? ""))}
              valueFormatter={formatPrice}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="b2c" stackId="sales" fill="var(--color-b2c)" />
        <Bar dataKey="b2b" stackId="sales" fill="var(--color-b2b)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
