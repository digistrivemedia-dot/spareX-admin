"use server"

import * as api from "@/features/masters/api"
import {
  inspectionTemplateSchema,
  partBrandSchema,
  productCategorySchema,
  serviceCategorySchema,
  serviceItemSchema,
  vehicleBrandSchema,
  vehicleModelSchema,
  vehicleTypeSchema,
  vehicleVariantSchema,
  type InspectionTemplateValues,
  type PartBrandValues,
  type ProductCategoryValues,
  type ServiceCategoryValues,
  type ServiceItemValues,
  type VehicleBrandValues,
  type VehicleModelValues,
  type VehicleTypeValues,
  type VehicleVariantValues,
} from "@/features/masters/schemas"
import type { MasterKind } from "@/features/masters/types"
import { storeImage } from "@/features/uploads/api"
import { runMutation, runValidatedMutation } from "@/lib/server-action"

export async function updateVehicleTypeAction(id: string, values: VehicleTypeValues) {
  return runValidatedMutation(
    "masters.manage",
    vehicleTypeSchema,
    values,
    async (context, data) => {
      await api.updateVehicleType(context, id, data)
    },
  )
}

export async function saveVehicleBrandAction(id: string | null, values: VehicleBrandValues) {
  return runValidatedMutation(
    "masters.manage",
    vehicleBrandSchema,
    values,
    async (context, { logo, ...data }) => {
      await api.saveVehicleBrand(context, id, { ...data, logoUrl: await storeImage(context, logo) })
    },
  )
}

export async function saveVehicleModelAction(id: string | null, values: VehicleModelValues) {
  return runValidatedMutation(
    "masters.manage",
    vehicleModelSchema,
    values,
    async (context, data) => {
      const model = await api.saveVehicleModel(context, id, data)
      return { id: model.id }
    },
  )
}

export async function saveVehicleVariantAction(id: string | null, values: VehicleVariantValues) {
  return runValidatedMutation(
    "masters.manage",
    vehicleVariantSchema,
    values,
    async (context, data) => {
      await api.saveVehicleVariant(context, id, data)
    },
  )
}

export async function saveProductCategoryAction(id: string | null, values: ProductCategoryValues) {
  return runValidatedMutation(
    "masters.manage",
    productCategorySchema,
    values,
    async (context, { image, ...data }) => {
      await api.saveProductCategory(context, id, {
        ...data,
        imageUrl: await storeImage(context, image),
      })
    },
  )
}

export async function savePartBrandAction(id: string | null, values: PartBrandValues) {
  return runValidatedMutation(
    "masters.manage",
    partBrandSchema,
    values,
    async (context, { logo, ...data }) => {
      await api.savePartBrand(context, id, { ...data, logoUrl: await storeImage(context, logo) })
    },
  )
}

export async function saveServiceCategoryAction(id: string | null, values: ServiceCategoryValues) {
  return runValidatedMutation(
    "masters.manage",
    serviceCategorySchema,
    values,
    async (context, data) => {
      await api.saveServiceCategory(context, id, data)
    },
  )
}

export async function saveServiceItemAction(id: string | null, values: ServiceItemValues) {
  return runValidatedMutation(
    "masters.manage",
    serviceItemSchema,
    values,
    async (context, data) => {
      await api.saveServiceItem(context, id, data)
    },
  )
}

export async function saveInspectionTemplateAction(values: InspectionTemplateValues) {
  return runValidatedMutation(
    "masters.manage",
    inspectionTemplateSchema,
    values,
    async (context, data) => {
      await api.saveInspectionTemplate(context, data)
    },
  )
}

export async function setMasterActiveAction(kind: MasterKind, id: string, active: boolean) {
  return runMutation("masters.manage", async (context) => {
    await api.setMasterActive(context, kind, id, active)
  })
}
