import type { FilterOption } from "@/components/ui/FilterSelect"
import type { Product, StockAdjustmentReason, StockStatus } from "@/features/catalog/types"

export function stockStatus(product: Pick<Product, "stock" | "lowStockLevel">): StockStatus {
  if (product.stock <= 0) return "out_of_stock"
  return product.stock <= product.lowStockLevel ? "low_stock" : "in_stock"
}

export const STOCK_STATUS_OPTIONS: FilterOption[] = [
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
]

export const FITMENT_OPTIONS: FilterOption[] = [
  { value: "has", label: "Has fitment" },
  { value: "none", label: "No fitment" },
]

export const STOCK_REASON_LABELS: Record<StockAdjustmentReason, string> = {
  purchase_received: "Purchase received",
  returned_to_stock: "Returned to stock",
  damaged: "Damaged",
  count_correction: "Count correction",
  other: "Other",
}

export const GST_RATE_OPTIONS: FilterOption[] = ["0", "5", "12", "18", "28"].map((rate) => ({
  value: rate,
  label: `${rate}%`,
}))

/** The "Subcategory" choice for a product filed directly under its category. */
export const NO_SUBCATEGORY = "none"

/** URL filters each catalogue list accepts; shared by the page and its CSV export. */
export const CATALOG_FILTERS = {
  products: ["category", "brand", "type", "stock", "fitment", "active"],
  stock: ["stock", "category"],
} as const

/** Columns of the CSV import templates, in order. */
export const IMPORT_TEMPLATES = {
  products: {
    columns: [
      "sku",
      "name",
      "category",
      "subcategory",
      "part_brand",
      "vehicle_types",
      "part_number",
      "hsn_code",
      "gst_rate",
      "mrp",
      "price",
      "stock",
      "low_stock_level",
      "warranty_months",
      "weight_grams",
      "description",
      "active",
    ],
    example: [
      "SPX-ENG-901",
      "Motul 5100 4T 15W-50, 1 L",
      "Engine oil and lubricants",
      "Engine oil",
      "Motul",
      "bike|scooter",
      "MOT51001",
      "27101980",
      "18",
      "680",
      "629",
      "40",
      "10",
      "0",
      "950",
      "Semi-synthetic engine oil for 4-stroke bikes.",
      "yes",
    ],
  },
  fitment: {
    columns: ["sku", "brand", "model", "variant", "year_from", "year_to"],
    example: ["SPX-ENG-001", "Honda", "Activa 6G", "", "2021", "2025"],
  },
} as const
