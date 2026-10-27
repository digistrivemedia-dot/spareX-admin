import Link from "next/link"

import { cn } from "@/lib/utils"

export type TabItem = {
  id: string
  label: string
  count?: number
  /** Links to its own route instead of `?tab=<id>`. */
  href?: string
}

type TabNavProps = {
  tabs: TabItem[]
  activeTab: string
  /** The page path; each tab links to `?tab=<id>`, so the open tab is in the URL. */
  basePath?: string
  label: string
}

/** Link-based tabs: only the open tab is rendered on the server, and it can be shared or bookmarked. */
export function TabNav({ tabs, activeTab, basePath, label }: TabNavProps) {
  return (
    <nav aria-label={label} className="-mb-px flex gap-1 overflow-x-auto border-b border-gray-200">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        return (
          <Link
            key={tab.id}
            href={tab.href ?? `${basePath}?tab=${tab.id}`}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active
                ? "border-orange-600 text-gray-900"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-gray-100 px-2 text-xs text-gray-600 tabular-nums">
                {tab.count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
