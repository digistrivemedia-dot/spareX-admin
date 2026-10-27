"use client"

import { AlertTriangle, RotateCw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  title?: string
  description?: string
  /** Shown as a "Try again" button. */
  onRetry?: () => void
  /** Extra actions, such as a link back to the dashboard. */
  children?: ReactNode
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Check your connection and try again.",
  onRetry,
  children,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-700">
        <AlertTriangle aria-hidden className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="max-w-sm text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCw aria-hidden />
            Try again
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
