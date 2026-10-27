import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { TabNav, type TabItem } from "@/components/layout/TabNav"

type KeyFact = { label: string; value: ReactNode }

type DetailLayoutProps = {
  back?: { href: string; label: string }
  title: string
  /** Usually a `StatusBadge`. */
  status?: ReactNode
  facts?: KeyFact[]
  /** The record's main actions; at most one primary. */
  actions?: ReactNode
  tabs?: { items: TabItem[]; active: string; basePath: string }
  /** The activity / audit timeline; beside the content on wide screens, below it on narrow ones. */
  activity?: ReactNode
  children: ReactNode
}

/** The frame for every record screen: header, key facts, actions, tabs and activity. */
export function DetailLayout({
  back,
  title,
  status,
  facts = [],
  actions,
  tabs,
  activity,
  children,
}: DetailLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        {back && (
          <Link
            href={back.href}
            className="inline-flex w-fit items-center gap-1 text-sm text-navy-700 hover:underline"
          >
            <ChevronLeft aria-hidden className="size-4" />
            {back.label}
          </Link>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold break-words text-gray-900">{title}</h1>
              {status}
            </div>
            {facts.length > 0 && (
              <dl className="flex flex-wrap gap-x-8 gap-y-2">
                {facts.map((fact) => (
                  <div key={fact.label} className="min-w-0">
                    <dt className="text-xs text-gray-500">{fact.label}</dt>
                    <dd className="text-sm font-medium text-gray-900">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      </header>

      {tabs && (
        <TabNav
          tabs={tabs.items}
          activeTab={tabs.active}
          basePath={tabs.basePath}
          label={`${title} sections`}
        />
      )}

      <div className={activity ? "grid gap-6 xl:grid-cols-3" : undefined}>
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">{children}</div>
        {activity && <aside aria-label="Activity">{activity}</aside>}
      </div>
    </div>
  )
}
