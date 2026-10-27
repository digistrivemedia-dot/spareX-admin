import type { Metadata } from "next"

import { ReportPage } from "@/features/reports/components/ReportPage"

export const metadata: Metadata = { title: "Service report" }

export default async function ServiceReportPage({ searchParams }: PageProps<"/reports/service">) {
  return <ReportPage kind="service" searchParams={await searchParams} />
}
