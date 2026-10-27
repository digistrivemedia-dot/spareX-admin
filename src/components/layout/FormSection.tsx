import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type FormSectionProps = {
  title: string
  description?: string
  /** "two" lays fields out in two columns from `md` up. */
  columns?: "one" | "two"
  children: ReactNode
}

/** A titled card that groups related fields inside a `FormLayout`. */
export function FormSection({ title, description, columns = "two", children }: FormSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-card shadow-sm">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className={cn("grid gap-5 p-4 sm:p-6", columns === "two" && "md:grid-cols-2")}>
        {children}
      </div>
    </section>
  )
}
