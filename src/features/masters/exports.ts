"use server"

import * as api from "@/features/masters/api"
import {
  FUEL_LABELS,
  MASTER_FILTERS,
  VEHICLE_TYPE_LABELS,
  formatYearRange,
} from "@/features/masters/utils"
import type { VehicleType } from "@/features/masters/types"
import { exportCsv } from "@/lib/csv-export"
import { listParamsFromQuery } from "@/lib/list-params"

const yesNo = (value: boolean) => (value ? "Yes" : "No")
const types = (values: VehicleType[]) => values.map((type) => VEHICLE_TYPE_LABELS[type]).join(", ")

export async function exportVehicleTypesAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.vehicleTypes)
  return exportCsv({
    entity: "master",
    label: "Vehicle types",
    load: (token) => api.vehicleTypesApi.all(token, params),
    columns: [
      { header: "Order", value: (row) => row.sortOrder },
      { header: "Name", value: (row) => row.name },
      { header: "Description", value: (row) => row.description },
      { header: "Brands", value: (row) => row.brandCount },
      { header: "Models", value: (row) => row.modelCount },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}

export async function exportVehicleBrandsAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.vehicleBrands)
  return exportCsv({
    entity: "master",
    label: "Vehicle brands",
    load: (token) => api.vehicleBrandsApi.all(token, params),
    columns: [
      { header: "Name", value: (row) => row.name },
      { header: "Vehicle types", value: (row) => types(row.vehicleTypes) },
      { header: "Models", value: (row) => row.modelCount },
      { header: "Description", value: (row) => row.description },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}

export async function exportVehicleModelsAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.vehicleModels)
  return exportCsv({
    entity: "master",
    label: "Vehicle models",
    load: (token) => api.vehicleModelsApi.all(token, params),
    columns: [
      { header: "Brand", value: (row) => row.brandName },
      { header: "Model", value: (row) => row.name },
      { header: "Vehicle type", value: (row) => VEHICLE_TYPE_LABELS[row.vehicleType] },
      { header: "Variants", value: (row) => row.variantCount },
      { header: "Fuels", value: (row) => row.fuels.map((fuel) => FUEL_LABELS[fuel]).join(", ") },
      { header: "Years", value: (row) => formatYearRange(row.yearRange) },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}

export async function exportProductCategoriesAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.productCategories)
  return exportCsv({
    entity: "master",
    label: "Product categories",
    load: (token) => api.productCategoriesApi.all(token, params),
    columns: [
      { header: "Name", value: (row) => row.name },
      { header: "Parent", value: (row) => row.parentName ?? "" },
      { header: "Order", value: (row) => row.sortOrder },
      { header: "Subcategories", value: (row) => row.subcategoryCount },
      { header: "Products", value: (row) => row.productCount },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}

export async function exportPartBrandsAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.partBrands)
  return exportCsv({
    entity: "master",
    label: "Part brands",
    load: (token) => api.partBrandsApi.all(token, params),
    columns: [
      { header: "Name", value: (row) => row.name },
      { header: "OEM", value: (row) => yesNo(row.isOem) },
      { header: "Products", value: (row) => row.productCount },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}

export async function exportServiceCategoriesAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.serviceCategories)
  return exportCsv({
    entity: "master",
    label: "Service categories",
    load: (token) => api.serviceCategoriesApi.all(token, params),
    columns: [
      { header: "Order", value: (row) => row.sortOrder },
      { header: "Name", value: (row) => row.name },
      { header: "Services", value: (row) => row.serviceCount },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}

export async function exportServicesAction(query: string) {
  const params = listParamsFromQuery(query, MASTER_FILTERS.serviceItems)
  return exportCsv({
    entity: "master",
    label: "Services",
    load: (token) => api.serviceItemsApi.all(token, params),
    columns: [
      { header: "Category", value: (row) => row.categoryName },
      { header: "Service", value: (row) => row.name },
      { header: "Description", value: (row) => row.description },
      { header: "Vehicle types", value: (row) => types(row.vehicleTypes) },
      { header: "Active", value: (row) => yesNo(row.active) },
    ],
  })
}
