"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { OrderStatusCount } from "@/features/dashboard/types"
import { humanize } from "@/lib/format"

const config = { count: { label: "Orders", color: "var(--color-chart-1)" } } satisfies ChartConfig

/** How many of the period's orders sit at each status; cancelled in grey. */
export function OrdersByStatusChart({ data }: { data: OrderStatusCount[] }) {
  const rows = data.map((row) => ({ ...row, label: humanize(row.status) }))
  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={112} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="count" />} />
        <Bar dataKey="count" radius={4}>
          {rows.map((row) => (
            <Cell
              key={row.status}
              fill={row.status === "cancelled" ? "var(--color-chart-6)" : "var(--color-count)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
