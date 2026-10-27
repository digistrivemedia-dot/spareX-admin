"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { Logo } from "@/components/layout/Logo"
import { SidebarNav } from "@/components/layout/SidebarNav"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Permission } from "@/features/auth/permissions"

/** Below `lg` the sidebar becomes a drawer opened from the top bar. */
export function MobileNav({ permissions }: { permissions: readonly Permission[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-white"
      >
        <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-5">
          <SheetTitle asChild>
            <div>
              <Logo tone="light" />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Main menu</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav permissions={permissions} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
