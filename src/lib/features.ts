/**
 * Feature switches for undecided features. A switch only hides or shows; the screens and types behind it are
 * always built and kept working. Shown read-only in Settings (A55).
 */
export const features = {
  /** Product reviews in moderation (A50) and on product records. Q-03. */
  productReviews: false,
  /** "Installation available" and charge fields on the product form (A29). Q-19. */
  productInstallation: false,
  /** Time-slot settings and slot columns in bookings. Off = date only + pickup time window. Q-20. */
  bookingTimeSlots: false,
  /** Coupons menu items (A47, A48). Q-06. */
  coupons: false,
  /** Cash on delivery for B2C orders. Q-05. */
  b2cCashOnDelivery: false,
  /** Garage payouts menu item (A59). Q-09. */
  garagePayouts: false,
} as const

export type FeatureSwitch = keyof typeof features

export function isEnabled(feature: FeatureSwitch): boolean {
  return features[feature]
}
