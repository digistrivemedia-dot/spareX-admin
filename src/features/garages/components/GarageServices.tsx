import { Wrench } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Price } from "@/components/ui/Price"
import type { GarageService } from "@/features/garages/types"
import { VEHICLE_TYPE_LABELS } from "@/features/masters/utils"

/** Services the garage offers from the service master, at the prices it sets itself (Q-08). */
export function GarageServices({ services }: { services: GarageService[] }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b border-gray-200 py-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Services and prices</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services yet"
            description="The garage picks services from the service master and sets prices on B2B."
            className="py-10"
          />
        ) : (
          <ul className="divide-y divide-gray-200">
            {services.map((service) => (
              <li key={service.serviceId} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500">
                    {service.vehicleTypes.map((type) => VEHICLE_TYPE_LABELS[type]).join(", ")} ·
                    about {service.durationMinutes} min
                  </p>
                </div>
                {service.price > 0 ? (
                  <Price paise={service.price} />
                ) : (
                  <span className="text-sm text-warning-700">No price</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
