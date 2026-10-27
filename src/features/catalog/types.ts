import type { VehicleType } from "@/features/masters/types"
import type { ActorRef, IsoDateTime, Paise } from "@/lib/types"

/** One vehicle a product fits. A null variant means every variant of the model; empty years means every year. */
export type Fitment = {
  id: string
  brandId: string
  modelId: string
  variantId: string | null
  years: number[]
}

export type ProductSpec = { label: string; value: string }

export type Product = {
  id: string
  name: string
  slug: string
  sku: string
  partNumber: string
  hsnCode: string
  gstRate: number
  categoryId: string
  subcategoryId: string | null
  partBrandId: string
  vehicleTypes: VehicleType[]
  description: string
  specs: ProductSpec[]
  images: string[]
  mrp: Paise
  /** B2C selling price, incl. GST. B2B price = this minus the business's discount %. */
  price: Paise
  stock: number
  lowStockLevel: number
  dimensionsMm: { length: number; width: number; height: number } | null
  weightGrams: number
  warrantyMonths: number
  fitment: Fitment[]
  seoTitle: string
  seoDescription: string
  active: boolean
  /** Behind the `productInstallation` switch. */
  installationAvailable: boolean
  installationCharge: Paise | null
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export type StockAdjustmentReason =
  "purchase_received" | "damaged" | "count_correction" | "returned_to_stock" | "other"

export type StockAdjustment = {
  id: string
  productId: string
  /** Positive adds stock, negative removes it. */
  change: number
  balanceAfter: number
  reason: StockAdjustmentReason
  note: string
  at: IsoDateTime
  by: ActorRef
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock"

/** List and detail rows carry the names the screens show, as the real endpoints will return them. */
export type ProductListItem = Product & {
  categoryName: string
  subcategoryName: string | null
  partBrandName: string
  fitmentCount: number
  stockStatus: StockStatus
}

export type ProductOption = { id: string; name: string; sku: string; price: Paise }

export type StockListItem = Pick<
  ProductListItem,
  "id" | "name" | "sku" | "images" | "categoryName" | "stock" | "lowStockLevel" | "stockStatus"
> & { lastAdjustedAt: IsoDateTime | null }

export type ImportKind = "products" | "fitment"

/** One CSV row after the server has checked it. Rows with errors are skipped on import. */
export type ImportRowResult = {
  row: number
  sku: string
  action: "create" | "update" | "add_fitment"
  summary: string
  errors: string[]
}

export type ImportPreview = { rows: ImportRowResult[]; validCount: number; errorCount: number }

export type ImportResult = { imported: number; skipped: number }
