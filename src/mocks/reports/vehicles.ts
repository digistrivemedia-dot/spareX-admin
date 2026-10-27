import "server-only"

import type { Report, ReportColumn, ReportQuery } from "@/features/reports/types"
import type { Vehicle } from "@/features/vehicles/types"
import { humanize } from "@/lib/format"
import { products } from "@/mocks/catalog"
import { jobCards } from "@/mocks/job-cards"
import { vehicleBrands, vehicleModels } from "@/mocks/masters"
import { breakdown, buildSeries, inRange, sum } from "@/mocks/reports/shared"
import { vehicles } from "@/mocks/vehicles"

const COLUMNS: ReportColumn[] = [
  { key: "vehicles", label: "Vehicles", format: "count" },
  { key: "services", label: "Services in period", format: "count" },
  { key: "spend", label: "Maintenance spend", format: "money" },
]

const GAP_COLUMNS: ReportColumn[] = [
  { key: "vehicles", label: "Vehicles", format: "count" },
  { key: "parts", label: "Parts that fit", format: "count" },
]

/** Models customers own with fewer fitting parts than this are flagged as fitment gaps. */
const GAP_PART_LIMIT = 5

/** A54: type-, brand- and model-wise, service frequency, maintenance spend and fitment gaps. */
export function vehicleReport(query: ReportQuery): Report {
  const services = jobCards.filter((card) => inRange(card.createdAt, query))
  const servicesOf = (vehicle: Vehicle) => services.filter((card) => card.vehicleId === vehicle.id)

  const group = (vehicle: Vehicle) => {
    if (query.dimension === "brand") {
      const brand = vehicleBrands.find((candidate) => candidate.id === vehicle.brandId)
      return brand ? { id: brand.id, name: brand.name } : null
    }
    if (query.dimension === "model") {
      const model = vehicleModels.find((candidate) => candidate.id === vehicle.modelId)
      const brand = vehicleBrands.find((candidate) => candidate.id === model?.brandId)
      return model ? { id: model.id, name: `${brand?.name ?? ""} ${model.name}`.trim() } : null
    }
    return { id: vehicle.vehicleType, name: humanize(vehicle.vehicleType) }
  }

  const gaps = vehicleModels
    .map((model) => ({
      id: model.id,
      name: `${vehicleBrands.find((brand) => brand.id === model.brandId)?.name ?? ""} ${model.name}`.trim(),
      detail: humanize(model.vehicleType),
      values: {
        vehicles: vehicles.filter((vehicle) => vehicle.modelId === model.id).length,
        parts: products.filter((product) => product.fitment.some((fit) => fit.modelId === model.id))
          .length,
      },
    }))
    .filter((row) => row.values.vehicles > 0 && row.values.parts < GAP_PART_LIMIT)
    .sort((a, b) => b.values.vehicles - a.values.vehicles || a.values.parts - b.values.parts)

  return {
    stats: [
      { label: "Vehicles", value: vehicles.length, format: "count" },
      {
        label: "Not linked",
        value: vehicles.filter((vehicle) => !vehicle.ownerId).length,
        format: "count",
        hint: "Walk-in vehicles without a customer",
      },
      { label: "Services in period", value: services.length, format: "count" },
      {
        label: "Maintenance spend",
        value: sum(services, (card) => card.invoice?.total ?? 0),
        format: "money",
        hint: "Invoiced by garages, incl. GST",
      },
    ],
    chartTitle: "Services by period",
    series: buildSeries(
      services,
      query,
      (card) => card.createdAt,
      [{ key: "services", label: "Services" }],
      "count",
      () => ({ key: "services", amount: 1 }),
    ),
    table: {
      title: `${humanize(query.dimension === "type" ? "vehicle type" : query.dimension)}-wise`,
      columns: COLUMNS,
      rows: breakdown(
        vehicles,
        group,
        COLUMNS,
        (vehicle) => ({
          vehicles: 1,
          services: servicesOf(vehicle).length,
          spend: sum(servicesOf(vehicle), (card) => card.invoice?.total ?? 0),
        }),
        query,
      ),
    },
    extraTable: {
      title: "Fitment gaps",
      description: `Models customers own that have fewer than ${GAP_PART_LIMIT} parts mapped. Add fitment for these first.`,
      columns: GAP_COLUMNS,
      rows: gaps,
    },
  }
}
