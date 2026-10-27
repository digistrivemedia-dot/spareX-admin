import type { IsoDateTime } from "@/lib/types"

export type ReviewStatus = "published" | "hidden"

export type ReviewKind = "garage" | "product"

/** Customers rate garages after a completed booking. */
export type GarageReview = {
  id: string
  garageId: string
  garageName: string
  bookingId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  status: ReviewStatus
  hiddenReason: string | null
  createdAt: IsoDateTime
}

/** Behind the `productReviews` switch (off at launch). */
export type ProductReview = {
  id: string
  productId: string
  productName: string
  customerId: string
  customerName: string
  rating: number
  title: string
  comment: string
  status: ReviewStatus | "pending"
  hiddenReason: string | null
  createdAt: IsoDateTime
}
