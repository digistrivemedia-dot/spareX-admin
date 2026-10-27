"use client"

import { usePathname } from "next/navigation"

import { TabNav } from "@/components/layout/TabNav"

const MASTERS = [
  { id: "vehicle-types", label: "Vehicle types", href: "/masters/vehicle-types" },
  { id: "vehicle-brands", label: "Vehicle brands", href: "/masters/vehicle-brands" },
  { id: "vehicle-models", label: "Models and variants", href: "/masters/vehicle-models" },
  { id: "categories", label: "Product categories", href: "/masters/categories" },
  { id: "part-brands", label: "Part brands", href: "/masters/part-brands" },
  { id: "services", label: "Services", href: "/masters/services" },
  { id: "service-categories", label: "Service categories", href: "/masters/service-categories" },
  { id: "inspection", label: "Inspection checklist", href: "/masters/inspection" },
]

/** Switches between the master lists; each is its own route. */
export function MastersNav() {
  const active = usePathname().split("/")[2] ?? MASTERS[0].id
  return <TabNav tabs={MASTERS} activeTab={active} label="Masters" />
}
