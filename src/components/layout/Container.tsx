import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Page width and gutters for everything inside the panel. */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  )
}
