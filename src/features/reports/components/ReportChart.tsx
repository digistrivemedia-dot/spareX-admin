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
import type { ReportSeries } from "@/features/reports/types"
import { formatReportValue } from "@/features/reports/utils"
import { formatCompactPrice, formatNumber } from "@/lib/format"

/** A report's series as stacked bars per period, in the theme's chart colours. */
export function ReportChart({ series }: { series: ReportSeries }) {
  const config = Object.fromEntries(
    series.keys.map(({ key, label }, index) => [
      key,
      { label, color: `var(--color-chart-${index + 1})` },
    ]),
  ) satisfies ChartConfig
  const data = series.points.map((point) => ({ label: point.label, ...point.values }))
  const last = series.keys.at(-1)?.key

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          allowDecimals={false}
          tickFormatter={series.format === "money" ? formatCompactPrice : formatNumber}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              valueFormatter={(value) => formatReportValue(Number(value), series.format)}
            />
          }
        />
        {series.keys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.keys.map(({ key }) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="report"
            fill={`var(--color-${key})`}
            radius={key === last ? [4, 4, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
