import { MapPin } from "lucide-react"

import type { GeoPoint } from "@/lib/types"

/** Opens the location in Google Maps; there is no embedded map. */
export function MapLink({
  location,
  label = "Open in Google Maps",
}: {
  location: GeoPoint
  label?: string
}) {
  const href = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"
    >
      <MapPin aria-hidden className="size-4" />
      {label}
    </a>
  )
}
