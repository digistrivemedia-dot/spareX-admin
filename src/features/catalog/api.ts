import "server-only"

import type { ProductInput, StockAdjustmentInput } from "@/features/catalog/schemas"
import type {
  Fitment,
  ImportKind,
  ImportPreview,
  ImportResult,
  Product,
  ProductListItem,
  ProductOption,
  StockAdjustment,
  StockListItem,
} from "@/features/catalog/types"
import type {
  PartBrand,
  ProductCategory,
  VehicleBrand,
  VehicleModel,
  VehicleVariant,
} from "@/features/masters/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import { listParamsToQuery } from "@/lib/list-params"
import type { ListParams, Paginated, RequestContext } from "@/lib/types"
import * as mock from "@/mocks/catalog-api"
import * as importMock from "@/mocks/catalog-import"

const useMock = dataSource.catalog === "mock"

export type ProductFormOptions = {
  categories: ProductCategory[]
  partBrands: PartBrand[]
  vehicleBrands: VehicleBrand[]
  vehicleModels: VehicleModel[]
  vehicleVariants: VehicleVariant[]
  products: ProductOption[]
}

export async function listProducts(
  token: string,
  params: ListParams,
): Promise<Paginated<ProductListItem>> {
  if (useMock) return mock.listProducts(params)
  return apiClient.get("/products", { token, query: listParamsToQuery(params) })
}

export async function allProducts(token: string, params: ListParams): Promise<ProductListItem[]> {
  if (useMock) return mock.allProducts(params)
  return apiClient.get("/products/all", { token, query: listParamsToQuery(params) })
}

export async function getProduct(token: string, id: string): Promise<ProductListItem | null> {
  if (useMock) return mock.getProduct(id)
  return apiClient.get(`/products/${id}`, { token })
}

export async function getProductOptions(token: string): Promise<ProductOption[]> {
  if (useMock) return mock.productOptions()
  return apiClient.get("/products/options", { token })
}

export async function getProductFormOptions(token: string): Promise<ProductFormOptions> {
  if (useMock) return mock.productFormOptions()
  return apiClient.get("/products/form-options", { token })
}

export async function getProductFitment(token: string, id: string): Promise<Fitment[]> {
  if (useMock) return mock.getProductFitment(id)
  return apiClient.get(`/products/${id}/fitment`, { token })
}

export async function saveProduct(
  context: RequestContext,
  id: string | null,
  input: ProductInput,
): Promise<Product> {
  if (useMock) return mock.saveProduct(context.actor, id, input)
  const options = { token: context.token }
  return id
    ? apiClient.patch(`/products/${id}`, input, options)
    : apiClient.post("/products", input, options)
}

export async function setProductsActive(context: RequestContext, ids: string[], active: boolean) {
  if (useMock) return mock.setProductsActive(context.actor, ids, active)
  return apiClient.post("/products/active", { ids, active }, { token: context.token })
}

export async function listStock(
  token: string,
  params: ListParams,
): Promise<Paginated<StockListItem>> {
  if (useMock) return mock.listStock(params)
  return apiClient.get("/stock", { token, query: listParamsToQuery(params) })
}

export async function allStock(token: string, params: ListParams): Promise<StockListItem[]> {
  if (useMock) return mock.allStock(params)
  return apiClient.get("/stock/all", { token, query: listParamsToQuery(params) })
}

export async function adjustStock(
  context: RequestContext,
  input: StockAdjustmentInput,
): Promise<StockAdjustment> {
  if (useMock) return mock.adjustStock(context.actor, input)
  return apiClient.post(`/stock/${input.productId}/adjustments`, input, { token: context.token })
}

export async function getStockHistory(
  token: string,
  productId: string,
): Promise<StockAdjustment[]> {
  if (useMock) return mock.stockHistory(productId)
  return apiClient.get(`/stock/${productId}/adjustments`, { token })
}

export async function previewImport(
  token: string,
  kind: ImportKind,
  csv: string,
): Promise<ImportPreview> {
  if (useMock) return importMock.previewImport(kind, csv)
  return apiClient.post(`/imports/${kind}/preview`, { csv }, { token })
}

export async function commitImport(
  context: RequestContext,
  kind: ImportKind,
  csv: string,
): Promise<ImportResult> {
  if (useMock) return importMock.commitImport(context.actor, kind, csv)
  return apiClient.post(`/imports/${kind}`, { csv }, { token: context.token })
}
