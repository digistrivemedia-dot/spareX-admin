"use server"

import * as api from "@/features/catalog/api"
import { CATALOG_FILTERS } from "@/features/catalog/utils"
import { exportCsv } from "@/lib/csv-export"
import { formatDateTime, humanize } from "@/lib/format"
import { listParamsFromQuery } from "@/lib/list-params"

/** Money is exported as plain rupees so spreadsheets can add it up. */
const rupees = (paise: number) => (paise / 100).toFixed(2)

export async function exportProductsAction(query: string) {
  const params = listParamsFromQuery(query, CATALOG_FILTERS.products)
  return exportCsv({
    entity: "product",
    label: "Products",
    load: (token) => api.allProducts(token, params),
    columns: [
      { header: "SKU", value: (row) => row.sku },
      { header: "Name", value: (row) => row.name },
      { header: "Category", value: (row) => row.categoryName },
      { header: "Subcategory", value: (row) => row.subcategoryName ?? "" },
      { header: "Part brand", value: (row) => row.partBrandName },
      { header: "Part no.", value: (row) => row.partNumber },
      { header: "HSN", value: (row) => row.hsnCode },
      { header: "GST %", value: (row) => row.gstRate },
      { header: "MRP (₹, incl. GST)", value: (row) => rupees(row.mrp) },
      { header: "B2C price (₹, incl. GST)", value: (row) => rupees(row.price) },
      { header: "Stock", value: (row) => row.stock },
      { header: "Fitment count", value: (row) => row.fitmentCount },
      { header: "Active", value: (row) => (row.active ? "Yes" : "No") },
    ],
  })
}

export async function exportStockAction(query: string) {
  const params = listParamsFromQuery(query, CATALOG_FILTERS.stock)
  return exportCsv({
    entity: "stock",
    label: "Stock",
    load: (token) => api.allStock(token, params),
    columns: [
      { header: "SKU", value: (row) => row.sku },
      { header: "Product", value: (row) => row.name },
      { header: "Category", value: (row) => row.categoryName },
      { header: "Stock", value: (row) => row.stock },
      { header: "Low-stock level", value: (row) => row.lowStockLevel },
      { header: "Status", value: (row) => humanize(row.stockStatus) },
      {
        header: "Last adjusted",
        value: (row) => (row.lastAdjustedAt ? formatDateTime(row.lastAdjustedAt) : ""),
      },
    ],
  })
}
