import { redirect } from "next/navigation"

import { HOME_ROUTE } from "@/lib/navigation"

export default function RootPage() {
  redirect(HOME_ROUTE)
}
