import { Skeleton } from "@/components/ui/skeleton"

/** Loading state for a list screen: header, toolbar and rows. `header={false}` when a layout already shows one. */
export function ListSkeleton({ rows = 8, header = true }: { rows?: number; header?: boolean }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      {header && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-card shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 p-4">
          <Skeleton className="h-8 w-full sm:w-64" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex h-12 items-center gap-4 px-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
