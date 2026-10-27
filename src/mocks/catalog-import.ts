import "server-only"

import type {
  Fitment,
  ImportKind,
  ImportPreview,
  ImportResult,
  Product,
} from "@/features/catalog/types"
import { IMPORT_TEMPLATES } from "@/features/catalog/utils"
import type { VehicleType } from "@/features/masters/types"
import { ApiError } from "@/lib/api-client"
import { GST_RATE_PERCENT, MAX_IMPORT_ROWS } from "@/lib/constants"
import { parseCsvRecords } from "@/lib/csv"
import type { ActorRef } from "@/lib/types"
import { recordAuditEntry } from "@/mocks/audit"
import { products } from "@/mocks/catalog"
import {
  partBrands,
  productCategories,
  slugify,
  vehicleBrands,
  vehicleModels,
  vehicleVariants,
} from "@/mocks/masters"
import { delay, newId } from "@/mocks/utils"

const VEHICLE_TYPES: VehicleType[] = ["bike", "scooter", "car", "commercial"]
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** A checked row: what it would do, its errors, and the change to apply when it has none. */
type CheckedRow = {
  sku: string
  action: "create" | "update" | "add_fitment"
  summary: string
  errors: string[]
  apply: () => void
}

function checkProductRow(row: Record<string, string>): CheckedRow {
  const errors: string[] = []
  const sku = (row.sku ?? "").toUpperCase()
  if (!/^[A-Z0-9-]{3,30}$/.test(sku))
    errors.push("SKU must be 3–30 capital letters, numbers and dashes.")
  const name = row.name ?? ""
  if (name.length < 3) errors.push("Name is missing.")
  const category = productCategories.find(
    (item) => item.parentId === null && sameName(item.name, row.category ?? ""),
  )
  if (!category) errors.push(`Category "${row.category}" not found.`)
  const subcategory = row.subcategory
    ? productCategories.find(
        (item) => item.parentId === category?.id && sameName(item.name, row.subcategory ?? ""),
      )
    : undefined
  if (row.subcategory && !subcategory)
    errors.push(`Subcategory "${row.subcategory}" not found under the category.`)
  const brand = partBrands.find((item) => sameName(item.name, row.part_brand ?? ""))
  if (!brand) errors.push(`Part brand "${row.part_brand}" not found.`)
  const types = (row.vehicle_types ?? "")
    .split("|")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)
  if (types.length === 0 || types.some((type) => !VEHICLE_TYPES.includes(type as VehicleType))) {
    errors.push("Vehicle types must be bike, scooter, car or commercial, separated by |.")
  }
  const money = (value: string | undefined) =>
    /^\d+(\.\d{1,2})?$/.test(value ?? "") ? Math.round(Number(value) * 100) : NaN
  const whole = (value: string | undefined, fallback: number) =>
    value ? (/^\d+$/.test(value) ? Number(value) : NaN) : fallback
  const mrp = money(row.mrp)
  const price = money(row.price)
  if (Number.isNaN(mrp) || Number.isNaN(price))
    errors.push("MRP and price must be amounts in rupees.")
  else if (price > mrp) errors.push("Price is more than the MRP.")
  if (!/^\d{4,8}$/.test(row.hsn_code ?? "")) errors.push("HSN code must have 4 to 8 digits.")
  const gstRate = whole(row.gst_rate, GST_RATE_PERCENT)
  if (![0, 5, 12, 18, 28].includes(gstRate)) errors.push("GST rate must be 0, 5, 12, 18 or 28.")
  const numbers = {
    stock: whole(row.stock, 0),
    lowStockLevel: whole(row.low_stock_level, 10),
    warrantyMonths: whole(row.warranty_months, 0),
    weightGrams: whole(row.weight_grams, 0),
  }
  if (Object.values(numbers).some(Number.isNaN))
    errors.push("Stock, low-stock level, warranty and weight must be whole numbers.")

  const existing = products.find((product) => product.sku === sku)
  const fields = {
    name,
    categoryId: category?.id ?? "",
    subcategoryId: subcategory?.id ?? null,
    partBrandId: brand?.id ?? "",
    vehicleTypes: types as VehicleType[],
    partNumber: row.part_number ?? "",
    hsnCode: row.hsn_code ?? "",
    gstRate,
    mrp,
    price,
    lowStockLevel: numbers.lowStockLevel,
    warrantyMonths: numbers.warrantyMonths,
    weightGrams: numbers.weightGrams,
    description: row.description ?? "",
    active: !["no", "false", "0"].includes((row.active ?? "yes").toLowerCase()),
    updatedAt: new Date().toISOString(),
  }
  return {
    sku,
    action: existing ? "update" : "create",
    summary: existing
      ? `Update ${existing.name} (stock unchanged; adjust it on the Stock screen)`
      : `New product: ${name}`,
    errors,
    apply: () => {
      if (existing) {
        Object.assign(existing, fields, { slug: slugify(name) })
        return
      }
      const product: Product = {
        ...fields,
        id: newId("prd"),
        slug: slugify(name),
        sku,
        stock: numbers.stock,
        specs: [],
        images: [],
        dimensionsMm: null,
        fitment: [],
        seoTitle: `${name} | SpareX`,
        seoDescription: "",
        installationAvailable: false,
        installationCharge: null,
        createdAt: fields.updatedAt,
      }
      products.push(product)
    },
  }
}

function checkFitmentRow(row: Record<string, string>): CheckedRow {
  const errors: string[] = []
  const sku = (row.sku ?? "").toUpperCase()
  const product = products.find((item) => item.sku === sku)
  if (!product) errors.push(`No product with SKU "${row.sku}".`)
  const brand = vehicleBrands.find((item) => sameName(item.name, row.brand ?? ""))
  if (!brand) errors.push(`Vehicle brand "${row.brand}" not found.`)
  const model = vehicleModels.find(
    (item) => item.brandId === brand?.id && sameName(item.name, row.model ?? ""),
  )
  if (brand && !model) errors.push(`Model "${row.model}" not found for ${brand.name}.`)
  const variant = row.variant
    ? vehicleVariants.find(
        (item) => item.modelId === model?.id && sameName(item.name, row.variant ?? ""),
      )
    : null
  if (row.variant && model && !variant)
    errors.push(`Variant "${row.variant}" not found for ${model.name}.`)
  const from = row.year_from ? Number(row.year_from) : null
  const to = row.year_to ? Number(row.year_to) : from
  if (
    (row.year_from && !/^\d{4}$/.test(row.year_from)) ||
    (row.year_to && !/^\d{4}$/.test(row.year_to)) ||
    (from && to && to < from)
  ) {
    errors.push("Years must be 4-digit, with year_to not before year_from.")
  }
  const years = from && to ? Array.from({ length: to - from + 1 }, (_, i) => from + i) : []
  const vehicle =
    `${brand?.name ?? ""} ${model?.name ?? ""} ${variant?.name ?? "(all variants)"}`.trim()
  return {
    sku,
    action: "add_fitment",
    summary: `${product?.name ?? sku} fits ${vehicle}${years.length ? `, ${from}–${to}` : ", all years"}`,
    errors,
    apply: () => {
      if (!product || !brand || !model) return
      const fitment: Fitment = {
        id: newId("fit"),
        brandId: brand.id,
        modelId: model.id,
        variantId: variant?.id ?? null,
        years,
      }
      const duplicate = product.fitment.some(
        (item) => item.modelId === fitment.modelId && item.variantId === fitment.variantId,
      )
      if (!duplicate) product.fitment.push(fitment)
    },
  }
}

function checkCsv(kind: ImportKind, csv: string): CheckedRow[] {
  const records = parseCsvRecords(csv)
  if (records.length === 0) throw new ApiError("The file has no rows.", 422)
  if (records.length > MAX_IMPORT_ROWS)
    throw new ApiError(`Import up to ${MAX_IMPORT_ROWS} rows at a time.`, 422)
  const missing = IMPORT_TEMPLATES[kind].columns.filter((column) => !(column in (records[0] ?? {})))
  if (missing.length)
    throw new ApiError(`Missing columns: ${missing.join(", ")}. Download the template.`, 422)
  const checked = records.map(kind === "products" ? checkProductRow : checkFitmentRow)
  // A SKU repeated in a product file would silently overwrite itself, so it is an error.
  if (kind === "products") {
    checked.forEach((row, index) => {
      if (checked.findIndex((other) => other.sku === row.sku) !== index)
        row.errors.push("SKU repeats an earlier row.")
    })
  }
  return checked
}

export async function previewImport(kind: ImportKind, csv: string): Promise<ImportPreview> {
  await delay()
  // Row 1 is the header, so data starts on row 2 (as the admin sees it in a spreadsheet).
  const rows = checkCsv(kind, csv).map(({ sku, action, summary, errors }, index) => ({
    row: index + 2,
    sku,
    action,
    summary,
    errors,
  }))
  const errorCount = rows.filter((row) => row.errors.length > 0).length
  return { rows, validCount: rows.length - errorCount, errorCount }
}

export async function commitImport(
  actor: ActorRef,
  kind: ImportKind,
  csv: string,
): Promise<ImportResult> {
  await delay()
  const rows = checkCsv(kind, csv)
  const valid = rows.filter((row) => row.errors.length === 0)
  valid.forEach((row) => row.apply())
  recordAuditEntry(actor, {
    action: "import",
    entity: kind === "products" ? "product" : "fitment",
    entityId: "",
    entityLabel: kind === "products" ? "Product import" : "Fitment import",
    summary: `Imported ${kind} from CSV (${valid.length} rows, ${rows.length - valid.length} skipped)`,
    changes: [],
  })
  return { imported: valid.length, skipped: rows.length - valid.length }
}
