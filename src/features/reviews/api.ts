import "server-only"

import type {
  GarageReview,
  ProductReview,
  ReviewKind,
  ReviewStatus,
} from "@/features/reviews/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/reviews-api"

const useMock = dataSource.reviews === "mock"

export const garageReviewsApi = listEndpoint<GarageReview>(
  dataSource.reviews,
  "/reviews/garages",
  mock.garageReviewEndpoint,
)

export const productReviewsApi = listEndpoint<ProductReview>(
  dataSource.reviews,
  "/reviews/products",
  mock.productReviewEndpoint,
)

export async function moderateReview(
  { actor, token }: RequestContext,
  kind: ReviewKind,
  id: string,
  status: ReviewStatus,
  reason: string | null,
) {
  if (useMock) return mock.moderateReview(actor, kind, id, status, reason)
  return apiClient.post(`/reviews/${kind}s/${id}/status`, { status, reason }, { token })
}
