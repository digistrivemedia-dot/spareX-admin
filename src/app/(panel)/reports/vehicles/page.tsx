import type { Metadata } from "next"

import { ReportPage } from "@/features/reports/components/ReportPage"

export const metadata: Metadata = { title: "Vehicle report" }

export default async function VehiclesReportPage({ searchParams }: PageProps<"/reports/vehicles">) {
  return <ReportPage kind="vehicles" searchParams={await searchParams} />
}
