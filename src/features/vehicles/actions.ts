"use server"

import { FUEL_LABELS, VEHICLE_TYPE_LABELS } from "@/features/masters/utils"
import * as api from "@/features/vehicles/api"
import { transferSchema, type TransferValues } from "@/features/vehicles/schemas"
import { VEHICLE_FILTERS } from "@/features/vehicles/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDate } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"
import { runValidatedMutation } from "@/lib/server-action"

export async function transferVehicleAction(values: TransferValues) {
  return runValidatedMutation("vehicles.manage", transferSchema, values, (context, data) =>
    api.transferVehicle(context, data.vehicleId, data.customerId, data.date),
  )
}

export async function exportVehiclesAction(query: string) {
  const params = listParamsFromQuery(query, VEHICLE_FILTERS)
  return exportCsv({
    entity: "vehicle",
    label: "Vehicles",
    load: (token) => api.vehiclesApi.all(token, params),
    columns: [
      { header: "Registration", value: (row) => row.registrationNumber },
      { header: "Type", value: (row) => VEHICLE_TYPE_LABELS[row.vehicleType] },
      { header: "Brand", value: (row) => row.brandName },
      { header: "Model", value: (row) => row.modelName },
      { header: "Variant", value: (row) => row.variantName },
      { header: "Year", value: (row) => row.year },
      { header: "Fuel", value: (row) => FUEL_LABELS[row.fuel] },
      { header: "Owner", value: (row) => row.ownerName ?? "Walk-in, not linked" },
      { header: "Added", value: (row) => formatDate(row.createdAt) },
    ],
  })
}
