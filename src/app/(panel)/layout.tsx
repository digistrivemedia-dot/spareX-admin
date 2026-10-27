import type { ReactNode } from "react"
import { Suspense } from "react"

import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopBar } from "@/components/layout/TopBar"

/**
 * The app shell. The sidebar and top bar read the session, so each streams in behind its own boundary and the page
 * (behind its `loading.tsx`) never waits for them.
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-3 py-2 text-sm font-medium text-navy-700 shadow focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      {/* The shell is left off printed pages such as invoices. */}
      <div className="contents print:hidden">
        <Suspense fallback={<div className="hidden w-64 shrink-0 bg-sidebar lg:block" />}>
          <AppSidebar />
        </Suspense>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="contents print:hidden">
          <Suspense fallback={<div className="h-16 shrink-0 border-b border-gray-200 bg-white" />}>
            <TopBar />
          </Suspense>
        </div>
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
