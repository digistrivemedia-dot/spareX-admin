"use server"

import * as api from "@/features/catalog/api"
import {
  importSchema,
  productSchema,
  stockAdjustmentSchema,
  type ProductValues,
  type StockAdjustmentValues,
} from "@/features/catalog/schemas"
import type { ImportKind } from "@/features/catalog/types"
import { storeImage } from "@/features/uploads/api"
import { validationFailure } from "@/lib/action-result"
import { runMutation, runQuery, runValidatedMutation } from "@/lib/server-action"

export async function saveProductAction(id: string | null, values: ProductValues) {
  return runValidatedMutation("catalog.manage", productSchema, values, async (context, data) => {
    const { images, lengthMm, widthMm, heightMm, installationCharge, ...rest } = data
    const product = await api.saveProduct(context, id, {
      ...rest,
      images: (await Promise.all(images.map((image) => storeImage(context, image)))).filter(
        (url): url is string => url !== null,
      ),
      dimensionsMm: lengthMm
        ? { length: Number(lengthMm), width: Number(widthMm), height: Number(heightMm) }
        : null,
      installationCharge: rest.installationAvailable
        ? Math.round(Number(installationCharge) * 100)
        : null,
    })
    return { id: product.id }
  })
}

export async function setProductsActiveAction(ids: string[], active: boolean) {
  return runMutation("catalog.manage", async (context) => {
    await api.setProductsActive(context, ids, active)
  })
}

/** For "copy fitment from another product" in the product form. */
export async function getProductFitmentAction(productId: string) {
  return runQuery("catalog.view", (token) => api.getProductFitment(token, productId))
}

export async function adjustStockAction(values: StockAdjustmentValues) {
  return runValidatedMutation(
    "stock.manage",
    stockAdjustmentSchema,
    values,
    async (context, data) => {
      await api.adjustStock(context, data)
    },
  )
}

export async function getStockHistoryAction(productId: string) {
  return runQuery("stock.view", (token) => api.getStockHistory(token, productId))
}

export async function previewImportAction(kind: ImportKind, csv: string) {
  const parsed = importSchema.safeParse({ kind, csv })
  if (!parsed.success) return validationFailure(parsed.error)
  return runQuery("catalog.manage", (token) => api.previewImport(token, kind, csv))
}

export async function commitImportAction(kind: ImportKind, csv: string) {
  return runValidatedMutation("catalog.manage", importSchema, { kind, csv }, (context, data) =>
    api.commitImport(context, data.kind, data.csv),
  )
}
