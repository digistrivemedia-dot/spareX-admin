import { redirect } from "next/navigation"

/** The menu's "Reports" opens the first report. */
export default function ReportsPage() {
  redirect("/reports/sales")
}
