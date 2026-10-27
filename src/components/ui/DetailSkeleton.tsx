import { Skeleton } from "@/components/ui/skeleton"

/** Loading state for a record: header, key facts, tabs and a content card. */
export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      <Skeleton className="h-4 w-24" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-56" />
        <div className="flex flex-wrap gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="grid gap-4 rounded-xl border border-gray-200 bg-card p-6 shadow-sm sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}
