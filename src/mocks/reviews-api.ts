import "server-only"

import type {
  GarageReview,
  ProductReview,
  ReviewKind,
  ReviewStatus,
} from "@/features/reviews/types"
import { ApiError } from "@/lib/api-client"
import { humanize } from "@/lib/format"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { garageReviews, productReviews } from "@/mocks/reviews"
import { delay, listEndpoint } from "@/mocks/utils"

const shared = {
  date: (row: { createdAt: string }) => row.createdAt,
  sortValues: {
    createdAt: (row: { createdAt: string }) => row.createdAt,
    rating: (row: { rating: number }) => row.rating,
  },
}

export const garageReviewEndpoint = listEndpoint<GarageReview>(() => garageReviews, {
  ...shared,
  searchText: (row) => `${row.garageName} ${row.customerName} ${row.comment}`,
  filters: {
    status: (row, value) => row.status === value,
    garage: (row, value) => row.garageId === value,
    rating: (row, value) => row.rating === Number(value),
  },
})

export const productReviewEndpoint = listEndpoint<ProductReview>(() => productReviews, {
  ...shared,
  searchText: (row) => `${row.productName} ${row.customerName} ${row.title} ${row.comment}`,
  filters: {
    status: (row, value) => row.status === value,
    rating: (row, value) => row.rating === Number(value),
  },
})

/** Publishes a review, or hides it with a reason the reviewer is not shown. */
export async function moderateReview(
  actor: ActorRef,
  kind: ReviewKind,
  id: string,
  status: ReviewStatus,
  reason: string | null,
) {
  await delay()
  const review =
    kind === "garage"
      ? garageReviews.find((candidate) => candidate.id === id)
      : productReviews.find((candidate) => candidate.id === id)
  if (!review) throw new ApiError("Review not found.", 404)
  const before = review.status
  review.status = status
  review.hiddenReason = status === "hidden" ? reason : null
  const subject = "garageName" in review ? review.garageName : review.productName
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "review",
    entityId: review.id,
    entityLabel: `${review.customerName} on ${subject}`,
    summary: status === "hidden" ? `Hid review: ${reason}` : "Published review",
    changes: [{ field: "Status", before: humanize(before), after: humanize(status) }],
  })
}
