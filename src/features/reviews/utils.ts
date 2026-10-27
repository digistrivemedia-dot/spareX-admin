import type { FilterOption } from "@/components/ui/FilterSelect"

export const GARAGE_REVIEW_FILTERS = ["status", "garage", "rating"] as const
export const PRODUCT_REVIEW_FILTERS = ["status", "rating"] as const

export const REVIEW_STATUS_OPTIONS: FilterOption[] = [
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
]

export const RATING_OPTIONS: FilterOption[] = [5, 4, 3, 2, 1].map((rating) => ({
  value: String(rating),
  label: `${rating} star${rating === 1 ? "" : "s"}`,
}))
