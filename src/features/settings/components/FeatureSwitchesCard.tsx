import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { features, type FeatureSwitch } from "@/lib/features"

const DESCRIPTIONS: Record<FeatureSwitch, { label: string; detail: string }> = {
  productReviews: {
    label: "Product reviews",
    detail: "Moderation tab and reviews on products (Q-03).",
  },
  productInstallation: {
    label: "Installation with parts",
    detail: "Installation fields on the product form (Q-19).",
  },
  bookingTimeSlots: {
    label: "Booking time slots",
    detail: "Time slots instead of date only + pickup window (Q-20).",
  },
  coupons: { label: "Coupons", detail: "Coupons menu and the coupon box on B2C (Q-06)." },
  b2cCashOnDelivery: { label: "B2C cash on delivery", detail: "COD at B2C checkout (Q-05)." },
  garagePayouts: { label: "Garage payouts", detail: "Payouts to partner garages (Q-09)." },
}

/** Read only: switches change in code (`lib/features.ts`) once the client decides. */
export function FeatureSwitchesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Feature switches</CardTitle>
        <CardDescription>
          Undecided features are built and switched off. A developer turns one on when the client
          confirms it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {(Object.keys(features) as FeatureSwitch[]).map((key) => (
            <li key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <div>
                <p className="font-medium text-gray-900">{DESCRIPTIONS[key].label}</p>
                <p className="text-sm text-gray-500">{DESCRIPTIONS[key].detail}</p>
              </div>
              <StatusBadge domain="feature" status={features[key] ? "on" : "off"} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
