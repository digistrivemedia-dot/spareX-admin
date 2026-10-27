import type { ReactNode } from "react"
import { Suspense } from "react"

import { Container } from "@/components/layout/Container"
import { PageHeader } from "@/components/layout/PageHeader"
import { MastersNav } from "@/features/masters/components/MastersNav"

export default function MastersLayout({ children }: { children: ReactNode }) {
  return (
    <Container>
      <PageHeader
        title="Masters"
        description="The reference lists behind fitment, the catalogue and service: vehicles, categories, brands and services."
      />
      {/* The nav reads the URL, which dynamic routes only know at request time. */}
      <Suspense fallback={<div className="h-11 border-b border-gray-200" />}>
        <MastersNav />
      </Suspense>
      {children}
    </Container>
  )
}
