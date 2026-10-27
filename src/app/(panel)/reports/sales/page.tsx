import type { Metadata } from "next"

import { ReportPage } from "@/features/reports/components/ReportPage"

export const metadata: Metadata = { title: "Sales report" }

export default async function SalesReportPage({ searchParams }: PageProps<"/reports/sales">) {
  return <ReportPage kind="sales" searchParams={await searchParams} />
}
