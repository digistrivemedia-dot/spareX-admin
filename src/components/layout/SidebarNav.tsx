"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Permission } from "@/features/auth/permissions"
import { activeHref, visibleNavigation } from "@/lib/navigation"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  permissions: readonly Permission[]
  /** Icons only, with the label in a tooltip. */
  collapsed?: boolean
  /** Lets the mobile drawer close after a link is followed. */
  onNavigate?: () => void
}

/** The menu, grouped by area and filtered by the admin's permissions and feature switches. */
export function SidebarNav({ permissions, collapsed = false, onNavigate }: SidebarNavProps) {
  const current = activeHref(usePathname())

  return (
    <nav aria-label="Main" className="flex flex-col gap-5 px-3 py-4">
      {visibleNavigation(permissions).map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p
            className={cn(
              "px-3 pb-1 text-xs font-medium tracking-wide text-navy-200/70 uppercase",
              collapsed && "sr-only",
            )}
          >
            {section.label}
          </p>
          {section.items.map((item) => {
            const active = item.href === current
            const link = (
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none",
                  active
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon
                  aria-hidden
                  className={cn("size-4 shrink-0", active && "text-orange-500")}
                />
                <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
              </Link>
            )
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
