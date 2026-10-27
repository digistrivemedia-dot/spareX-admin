"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type QuickViewDrawerProps = {
  trigger: ReactNode
  title: string
  description?: string
  /** Link to the full record. */
  href?: string
  children: ReactNode
}

/** A side panel for a quick look at a record from a list, without leaving the page. */
export function QuickViewDrawer({
  trigger,
  title,
  description,
  href,
  children,
}: QuickViewDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-gray-200">
          <SheetTitle className="text-lg font-semibold text-gray-900">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {href && (
          <SheetFooter className="border-t border-gray-200">
            <Button asChild>
              <Link href={href}>
                Open full record
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
