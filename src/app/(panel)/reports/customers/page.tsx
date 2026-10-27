import type { Metadata } from "next"

import { ReportPage } from "@/features/reports/components/ReportPage"

export const metadata: Metadata = { title: "Customer report" }

export default async function CustomersReportPage({
  searchParams,
}: PageProps<"/reports/customers">) {
  return <ReportPage kind="customers" searchParams={await searchParams} />
}
