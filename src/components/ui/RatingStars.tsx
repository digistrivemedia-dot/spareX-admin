import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

/** A 1–5 rating as stars, read out as "4 out of 5". */
export function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            "size-4",
            star <= rating ? "fill-warning-500 text-warning-500" : "text-gray-300",
          )}
        />
      ))}
    </span>
  )
}
