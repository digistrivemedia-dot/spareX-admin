import "server-only"

import type { AuditChange } from "@/features/audit/types"
import type { ProductInput, StockAdjustmentInput } from "@/features/catalog/schemas"
import type {
  Fitment,
  Product,
  ProductListItem,
  ProductOption,
  StockAdjustment,
  StockListItem,
} from "@/features/catalog/types"
import { stockStatus } from "@/features/catalog/utils"
import type { VehicleType } from "@/features/masters/types"
import { ApiError } from "@/lib/api-client"
import { formatPrice } from "@/lib/format"
import type { ActorRef, ListParams } from "@/lib/types"
import { diffChanges, recordAuditEntry } from "@/mocks/audit"
import { products, stockAdjustments } from "@/mocks/catalog"
import {
  partBrands,
  productCategories,
  slugify,
  vehicleBrands,
  vehicleModels,
  vehicleVariants,
} from "@/mocks/masters"
import { delay, filterRows, newId, queryList, type QueryOptions } from "@/mocks/utils"

function toListItem(product: Product): ProductListItem {
  const name = (id: string | null) => productCategories.find((category) => category.id === id)?.name
  return {
    ...product,
    categoryName: name(product.categoryId) ?? "",
    subcategoryName: name(product.subcategoryId) ?? null,
    partBrandName: partBrands.find((brand) => brand.id === product.partBrandId)?.name ?? "",
    fitmentCount: product.fitment.length,
    stockStatus: stockStatus(product),
  }
}

const PRODUCT_QUERY: QueryOptions<ProductListItem> = {
  searchText: (row) => `${row.name} ${row.sku} ${row.partNumber} ${row.partBrandName}`,
  filters: {
    category: (row, value) => row.categoryId === value || row.subcategoryId === value,
    brand: (row, value) => row.partBrandId === value,
    type: (row, value) => row.vehicleTypes.includes(value as VehicleType),
    stock: (row, value) => row.stockStatus === value,
    fitment: (row, value) => (value === "none" ? row.fitmentCount === 0 : row.fitmentCount > 0),
    active: (row, value) => row.active === (value === "active"),
  },
  sortValues: {
    name: (row) => row.name,
    price: (row) => row.price,
    stock: (row) => row.stock,
    fitmentCount: (row) => row.fitmentCount,
    updatedAt: (row) => row.updatedAt,
  },
}

export async function listProducts(params: ListParams) {
  await delay()
  return queryList(products.map(toListItem), params, PRODUCT_QUERY)
}

export async function allProducts(params: ListParams) {
  await delay()
  return filterRows(products.map(toListItem), params, PRODUCT_QUERY)
}

export async function getProduct(id: string): Promise<ProductListItem | null> {
  await delay()
  const product = products.find((candidate) => candidate.id === id)
  return product ? toListItem(product) : null
}

export async function productOptions(): Promise<ProductOption[]> {
  return products.map(({ id, name, sku, price }) => ({ id, name, sku, price }))
}

export async function getProductFitment(id: string): Promise<Fitment[]> {
  await delay()
  return products.find((product) => product.id === id)?.fitment ?? []
}

function assertReferences(input: ProductInput, id: string | null) {
  const errors: Record<string, string[]> = {}
  const category = productCategories.find((item) => item.id === input.categoryId)
  if (!category || category.parentId !== null) errors.categoryId = ["Choose a top-level category."]
  if (input.subcategoryId) {
    const sub = productCategories.find((item) => item.id === input.subcategoryId)
    if (sub?.parentId !== input.categoryId)
      errors.subcategoryId = ["Pick a subcategory of the chosen category."]
  }
  if (!partBrands.some((brand) => brand.id === input.partBrandId))
    errors.partBrandId = ["Choose a part brand."]
  if (products.some((product) => product.id !== id && product.sku === input.sku)) {
    errors.sku = ["Another product already uses this SKU."]
  }
  if (Object.keys(errors).length) throw new ApiError("Check the highlighted fields.", 422, errors)
}

function fitmentLabel(fitment: Fitment[]): string {
  return `${fitment.length} vehicle${fitment.length === 1 ? "" : "s"}`
}

/** Saves a product and records separate audit entries for price, fitment and other changes. */
export async function saveProduct(actor: ActorRef, id: string | null, input: ProductInput) {
  await delay()
  assertReferences(input, id)
  const { openingStock, ...fields } = input
  const now = new Date().toISOString()
  const audit = (
    product: Product,
    entity: "product" | "price" | "fitment",
    summary: string,
    changes: AuditChange[] = [],
  ) =>
    recordAuditEntry(actor, {
      action: id ? "update" : "create",
      entity,
      entityId: product.id,
      entityLabel: product.name,
      summary,
      changes,
    })

  if (!id) {
    const record: Product = {
      id: newId("prd"),
      slug: slugify(input.name),
      stock: openingStock,
      createdAt: now,
      updatedAt: now,
      ...fields,
    }
    products.push(record)
    audit(record, "product", "Added product")
    if (openingStock > 0) {
      stockAdjustments.push({
        id: newId("stk"),
        productId: record.id,
        change: openingStock,
        balanceAfter: openingStock,
        reason: "purchase_received",
        note: "Opening stock",
        at: now,
        by: actor,
      })
    }
    return record
  }

  const existing = products.find((product) => product.id === id)
  if (!existing) throw new ApiError("Product not found.", 404)
  const before = {
    ...existing,
    mrpLabel: formatPrice(existing.mrp),
    priceLabel: formatPrice(existing.price),
  }
  Object.assign(existing, fields, { slug: slugify(input.name), updatedAt: now })
  const after = {
    ...existing,
    mrpLabel: formatPrice(existing.mrp),
    priceLabel: formatPrice(existing.price),
  }

  const priceChanges = diffChanges(before, after, { mrpLabel: "MRP", priceLabel: "B2C price" })
  if (priceChanges.length) audit(existing, "price", "Changed price", priceChanges)
  if (JSON.stringify(before.fitment) !== JSON.stringify(existing.fitment)) {
    audit(existing, "fitment", "Changed fitment", [
      {
        field: "Fitment",
        before: fitmentLabel(before.fitment),
        after: fitmentLabel(existing.fitment),
      },
    ])
  }
  const otherChanges = diffChanges(before, after, {
    name: "Name",
    sku: "SKU",
    partNumber: "Part no.",
    hsnCode: "HSN",
    gstRate: "GST %",
    categoryId: "Category",
    subcategoryId: "Subcategory",
    partBrandId: "Part brand",
    vehicleTypes: "Vehicle types",
    lowStockLevel: "Low-stock level",
    warrantyMonths: "Warranty (months)",
    active: "Active",
  })
  if (otherChanges.length) audit(existing, "product", "Edited product", otherChanges)
  return existing
}

export async function setProductsActive(actor: ActorRef, ids: string[], active: boolean) {
  await delay()
  for (const product of products.filter(
    (candidate) => ids.includes(candidate.id) && candidate.active !== active,
  )) {
    product.active = active
    product.updatedAt = new Date().toISOString()
    recordAuditEntry(actor, {
      action: "status_change",
      entity: "product",
      entityId: product.id,
      entityLabel: product.name,
      summary: active ? "Activated product" : "Deactivated product",
      changes: [{ field: "Active", before: active ? "No" : "Yes", after: active ? "Yes" : "No" }],
    })
  }
}

// Stock (A31): one Kannali quantity per product (Q-07), changed only through reasoned adjustments.

function stockRow(product: Product): StockListItem {
  const item = toListItem(product)
  const last = stockAdjustments.filter((adjustment) => adjustment.productId === product.id).at(-1)
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    images: item.images,
    categoryName: item.categoryName,
    stock: item.stock,
    lowStockLevel: item.lowStockLevel,
    stockStatus: item.stockStatus,
    lastAdjustedAt: last?.at ?? null,
  }
}

const STOCK_QUERY: QueryOptions<StockListItem> = {
  searchText: (row) => `${row.name} ${row.sku}`,
  filters: {
    stock: (row, value) => row.stockStatus === value,
    category: (row, value) =>
      products.find((product) => product.id === row.id)?.categoryId === value,
  },
  sortValues: {
    stock: (row) => row.stock,
    name: (row) => row.name,
    lastAdjustedAt: (row) => row.lastAdjustedAt,
  },
}

export async function listStock(params: ListParams) {
  await delay()
  return queryList(products.map(stockRow), params, STOCK_QUERY)
}

export async function allStock(params: ListParams) {
  await delay()
  return filterRows(products.map(stockRow), params, STOCK_QUERY)
}

export async function adjustStock(
  actor: ActorRef,
  input: StockAdjustmentInput,
): Promise<StockAdjustment> {
  await delay()
  const product = products.find((candidate) => candidate.id === input.productId)
  if (!product) throw new ApiError("Product not found.", 404)
  const change = input.direction === "add" ? input.quantity : -input.quantity
  if (product.stock + change < 0) {
    throw new ApiError("Check the highlighted field.", 422, {
      quantity: [`Only ${product.stock} in stock.`],
    })
  }
  const before = product.stock
  product.stock += change
  const adjustment: StockAdjustment = {
    id: newId("stk"),
    productId: product.id,
    change,
    balanceAfter: product.stock,
    reason: input.reason,
    note: input.note,
    at: new Date().toISOString(),
    by: actor,
  }
  stockAdjustments.push(adjustment)
  recordAuditEntry(actor, {
    action: "update",
    entity: "stock",
    entityId: product.id,
    entityLabel: product.name,
    summary: `Adjusted stock (${change > 0 ? "+" : ""}${change}): ${input.note}`,
    changes: [{ field: "Stock", before: String(before), after: String(product.stock) }],
  })
  return adjustment
}

export async function stockHistory(productId: string): Promise<StockAdjustment[]> {
  await delay()
  return stockAdjustments.filter((adjustment) => adjustment.productId === productId).toReversed()
}

/** Everything the product form needs for its selects and the fitment manager. */
export async function productFormOptions() {
  await delay()
  return {
    categories: productCategories,
    partBrands,
    vehicleBrands,
    vehicleModels,
    vehicleVariants,
    products: await productOptions(),
  }
}
