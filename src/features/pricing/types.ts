import type { BusinessStatus, BusinessType } from "@/features/businesses/types"
import type { Paise } from "@/lib/types"

/** A business's B2B discount, with the price it would pay for the previewed product. */
export type PricingRow = {
  businessId: string
  name: string
  type: BusinessType
  status: BusinessStatus
  discountPercent: number
  /** Only when a product is chosen for the preview. Both prices include GST. */
  preview: { b2cPrice: Paise; b2bPrice: Paise } | null
}
