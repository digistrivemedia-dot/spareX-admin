import type { FilterOption } from "@/components/ui/FilterSelect"
import type { BannerPlacement, ContentPageKind, Faq } from "@/features/content/types"
import { humanize } from "@/lib/format"

export const BANNER_FILTERS = ["placement", "active"] as const
export const FAQ_FILTERS = ["category", "active"] as const
export const PAGE_FILTERS = ["kind"] as const

export const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  b2c_hero: "B2C home hero",
  b2c_dashboard_promo: "B2C dashboard promo",
  b2b_offers: "B2B offers",
  announcement_strip: "Announcement strip",
}

const fromLabels = (labels: Record<string, string>): FilterOption[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }))

export const PLACEMENT_OPTIONS = fromLabels(PLACEMENT_LABELS)

export const PAGE_KIND_OPTIONS: FilterOption[] = (
  ["policy", "help"] satisfies ContentPageKind[]
).map((value) => ({ value, label: humanize(value) }))

export const FAQ_CATEGORIES: Faq["category"][] = [
  "orders",
  "returns",
  "payments",
  "fitment",
  "service",
  "account",
]

export const FAQ_CATEGORY_OPTIONS: FilterOption[] = FAQ_CATEGORIES.map((value) => ({
  value,
  label: humanize(value),
}))

/** Banners show between their dates while active. */
export function bannerState(banner: {
  active: boolean
  startsAt: string
  endsAt: string | null
}): "live" | "scheduled" | "ended" | "inactive" {
  const now = new Date().toISOString()
  if (!banner.active) return "inactive"
  if (banner.startsAt > now) return "scheduled"
  if (banner.endsAt && banner.endsAt < now) return "ended"
  return "live"
}

/** Moves one item up or down a list, for reordering without drag and drop. */
export function moveItem<T>(items: T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  const [item] = next.splice(index, 1)
  if (item !== undefined) next.splice(target, 0, item)
  return next
}
