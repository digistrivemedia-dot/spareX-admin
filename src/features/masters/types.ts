import type { IsoDateTime } from "@/lib/types"

/** Electric is a fuel type, not a vehicle type (Q-02). */
export type VehicleType = "bike" | "scooter" | "car" | "commercial"

export type FuelType = "petrol" | "diesel" | "cng" | "electric" | "hybrid"

export type VehicleTypeRecord = {
  id: VehicleType
  name: string
  description: string
  sortOrder: number
  active: boolean
}

export type VehicleBrand = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  description: string
  vehicleTypes: VehicleType[]
  active: boolean
  createdAt: IsoDateTime
}

export type VehicleModel = {
  id: string
  brandId: string
  name: string
  vehicleType: VehicleType
  active: boolean
}

export type VehicleVariant = {
  id: string
  modelId: string
  name: string
  fuel: FuelType
  /** Engine size; null for electric variants. */
  engineCc: number | null
  /** Battery capacity; only for electric variants. */
  batteryKwh: number | null
  years: number[]
  active: boolean
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
  /** null for a top-level category. */
  parentId: string | null
  imageUrl: string | null
  sortOrder: number
  active: boolean
}

export type PartBrand = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  /** Genuine manufacturer parts (Honda Genuine, Maruti Genuine…). */
  isOem: boolean
  active: boolean
}

export type ServiceCategory = {
  id: string
  name: string
  sortOrder: number
  active: boolean
}

/** A service name garages pick from. Garages set their own prices (Q-08). */
export type ServiceItem = {
  id: string
  categoryId: string
  name: string
  description: string
  vehicleTypes: VehicleType[]
  active: boolean
}

export type InspectionSection =
  | "engine"
  | "brakes"
  | "tyres"
  | "battery"
  | "suspension"
  | "lights"
  | "ac"
  | "electricals"
  | "fluids"
  | "body"

export type InspectionTemplate = {
  id: string
  vehicleType: VehicleType
  sections: { section: InspectionSection; items: { id: string; label: string }[] }[]
  updatedAt: IsoDateTime
}

/** List rows carry the counts and names the screens show, as the real list endpoints will return them. */
export type VehicleTypeListItem = VehicleTypeRecord & { brandCount: number; modelCount: number }

export type VehicleBrandListItem = VehicleBrand & { modelCount: number }

export type VehicleModelListItem = VehicleModel & {
  brandName: string
  variantCount: number
  fuels: FuelType[]
  /** First and last model year across its variants; null when it has no variants yet. */
  yearRange: { from: number; to: number } | null
}

export type VehicleModelDetail = VehicleModelListItem & { variants: VehicleVariant[] }

export type ProductCategoryListItem = ProductCategory & {
  parentName: string | null
  subcategoryCount: number
  productCount: number
}

export type PartBrandListItem = PartBrand & { productCount: number }

export type ServiceCategoryListItem = ServiceCategory & { serviceCount: number }

export type ServiceItemListItem = ServiceItem & { categoryName: string }

/** Every master record that can be switched on or off. */
export type MasterKind =
  | "vehicleType"
  | "vehicleBrand"
  | "vehicleModel"
  | "vehicleVariant"
  | "productCategory"
  | "partBrand"
  | "serviceCategory"
  | "serviceItem"
