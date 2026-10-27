import "server-only"

import type { GarageReview, ProductReview } from "@/features/reviews/types"
import { bookings } from "@/mocks/bookings"
import { products } from "@/mocks/catalog"
import { customers } from "@/mocks/customers"
import { daysAgo, persistent } from "@/mocks/utils"

/** [rating, comment, hidden reason]. One review per completed booking, in booking order. */
const GARAGE_REVIEWS: [number, string, string | null][] = [
  [5, "Picked up and dropped my bike on time. Clear estimate before any work.", null],
  [4, "Good service, took a little longer than promised.", null],
  [5, "Very professional. They showed me the old parts they replaced.", null],
  [2, "Waited an hour even with a booking.", null],
  [5, "Honest pricing and the bike feels new again.", null],
  [
    1,
    "Worst garage ever, these people are cheats!!! Call me on 98XXXXXX for the real story.",
    "Contains a phone number and abusive language.",
  ],
  [4, "Battery replaced quickly; staff were polite.", null],
  [5, "Excellent denting work, colour match is perfect.", null],
  [3, "Service was fine but the washing could be better.", null],
  [4, "AC is cooling well after the service.", null],
  [5, "Pick and drop made it very easy for me.", null],
  [
    2,
    "Check out my YouTube channel for bike reviews!",
    "Promotional content unrelated to the service.",
  ],
]

export const garageReviews = persistent<GarageReview[]>("garage-reviews", () =>
  bookings
    .filter((booking) => booking.status === "completed")
    .slice(0, GARAGE_REVIEWS.length)
    .map((booking, index) => {
      const [rating, comment, hiddenReason] = GARAGE_REVIEWS[index] ?? [5, "", null]
      return {
        id: `rev_${String(index + 1).padStart(3, "0")}`,
        garageId: booking.garageId,
        garageName: booking.garageName,
        bookingId: booking.id,
        customerId: booking.customer.id,
        customerName: booking.customer.name,
        rating,
        comment,
        status: hiddenReason ? "hidden" : "published",
        hiddenReason,
        createdAt: daysAgo(
          Math.max(0, Math.round((Date.now() - new Date(booking.date).getTime()) / 86_400_000) - 1),
          20,
        ),
      }
    }),
)

/** Behind the `productReviews` switch; kept so the moderation tab can be shown if the client turns it on. */
const PRODUCT_REVIEWS: [number, number, number, string, string, ProductReview["status"]][] = [
  [1, 2, 5, "Smooth engine", "Engine feels much smoother after switching to 7100.", "pending"],
  [29, 4, 4, "Good battery", "Fitted easily on my Activa.", "published"],
  [37, 9, 5, "Great grip", "Wet-road grip is excellent.", "published"],
  [62, 20, 3, "Okay helmet", "Visor scratches easily.", "pending"],
  [45, 11, 1, "Fake product", "Visit my store for genuine bulbs at half price.", "hidden"],
]

export const productReviews = persistent<ProductReview[]>("product-reviews", () =>
  PRODUCT_REVIEWS.map(([productNumber, customerNumber, rating, title, comment, status], index) => ({
    id: `prv_${index + 1}`,
    productId: products[productNumber - 1]?.id ?? "",
    productName: products[productNumber - 1]?.name ?? "",
    customerId: customers[customerNumber - 1]?.id ?? "",
    customerName: customers[customerNumber - 1]?.name ?? "",
    rating,
    title,
    comment,
    status,
    hiddenReason: status === "hidden" ? "Promotional content." : null,
    createdAt: daysAgo(index * 6 + 2, 19),
  })),
)
