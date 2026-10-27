import type { ActorRef, IsoDateTime } from "@/lib/types"

export type BannerPlacement =
  "b2c_hero" | "b2c_dashboard_promo" | "b2b_offers" | "announcement_strip"

export type Banner = {
  id: string
  title: string
  placement: BannerPlacement
  webImageUrl: string | null
  mobileImageUrl: string | null
  linkUrl: string
  startsAt: IsoDateTime
  /** null runs until switched off. */
  endsAt: IsoDateTime | null
  sortOrder: number
  active: boolean
}

export type FeaturedCategory = { id: string; categoryId: string; sortOrder: number }

export type FeaturedProduct = { id: string; productId: string; sortOrder: number }

/** Pages are edited as structured sections (heading + paragraphs); there is no rich-text editor. */
export type PageSection = {
  id: string
  heading: string
  paragraphs: string[]
}

export type ContentPageKind = "policy" | "help"

export type ContentPage = {
  id: string
  slug: string
  title: string
  kind: ContentPageKind
  sections: PageSection[]
  published: boolean
  updatedAt: IsoDateTime
  updatedBy: ActorRef
}

export type Faq = {
  id: string
  question: string
  answer: string
  category: "orders" | "returns" | "payments" | "fitment" | "service" | "account"
  sortOrder: number
  active: boolean
}

export type FeaturedKind = "categories" | "products"

/** A featured category or product with the name to show, in B2C home order. */
export type FeaturedItem = { id: string; name: string; detail: string }

export type FeaturedContent = Record<FeaturedKind, FeaturedItem[]> & {
  /** Everything that can be added, so the screen needs one call. */
  options: Record<FeaturedKind, FeaturedItem[]>
}
