import { TabNav } from "@/components/layout/TabNav"
import { isEnabled } from "@/lib/features"

/** Garage ratings always; the product reviews tab only while the `productReviews` switch is on. */
export function ReviewsTabs({ active }: { active: "garages" | "products" }) {
  if (!isEnabled("productReviews")) return null
  return (
    <TabNav
      label="Review type"
      activeTab={active}
      tabs={[
        { id: "garages", label: "Garage ratings", href: "/reviews" },
        { id: "products", label: "Product reviews", href: "/reviews/products" },
      ]}
    />
  )
}
