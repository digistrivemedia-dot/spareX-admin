"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { Logo } from "@/components/layout/Logo"
import { SidebarNav } from "@/components/layout/SidebarNav"
import type { Permission } from "@/features/auth/permissions"
import { HOME_ROUTE } from "@/lib/navigation"
import { useUiStore } from "@/lib/ui-store"
import { cn } from "@/lib/utils"

/** The navy sidebar from `lg` up. Collapses to icons; the choice is remembered. */
export function DesktopSidebar({ permissions }: { permissions: readonly Permission[] }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggle = useUiStore((state) => state.toggleSidebar)

  useEffect(() => {
    void useUiStore.persist.rehydrate()
  }, [])

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col bg-sidebar transition-[width] lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        <Link
          href={HOME_ROUTE}
          className="rounded-lg focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none"
        >
          <Logo tone="light" compact={collapsed} />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav permissions={permissions} collapsed={collapsed} />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cn(
            "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 focus-visible:outline-none",
            collapsed && "justify-center px-0",
          )}
        >
          <ToggleIcon aria-hidden className="size-4" />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  )
}
