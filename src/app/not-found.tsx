import type { Metadata } from "next"

import { Logo } from "@/components/layout/Logo"
import { PageNotFound } from "@/components/layout/PageNotFound"

export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
      <Logo />
      <PageNotFound />
    </main>
  )
}
