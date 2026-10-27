import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ChartCardProps = {
  title: string
  description?: string
  /** A small control in the header, such as a period switch. */
  action?: ReactNode
  /** The chart (shadcn `ChartContainer`), or an empty state when there is no data. */
  children: ReactNode
}

export function ChartCard({ title, description, action, children }: ChartCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
