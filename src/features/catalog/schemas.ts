import type { Control } from "react-hook-form"
import { z } from "zod"

import { NO_SUBCATEGORY } from "@/features/catalog/utils"
import { rupees, wholeNumber } from "@/lib/validation"

const vehicleType = z.enum(["bike", "scooter", "car", "commercial"])

/** Blank, or a whole number. */
const optionalMillimetres = z
  .string()
  .trim()
  .regex(/^\d{0,5}$/, "Enter millimetres as a whole number.")

const fitmentRowSchema = z.object({
  id: z.string(),
  brandId: z.string().min(1),
  modelId: z.string().min(1),
  variantId: z.string().nullable(),
  years: z.array(z.number().int()),
})

export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Enter the product name.").max(160),
    categoryId: z.string().min(1, "Choose a category."),
    subcategoryId: z
      .string()
      .transform((value) => (value === NO_SUBCATEGORY || value === "" ? null : value)),
    partBrandId: z.string().min(1, "Choose a part brand."),
    vehicleTypes: z.array(vehicleType).min(1, "Choose at least one vehicle type."),
    description: z.string().trim().max(2000),
    sku: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9-]{3,30}$/, "Use 3–30 capital letters, numbers and dashes."),
    partNumber: z.string().trim().min(2, "Enter the manufacturer's part number.").max(40),
    hsnCode: z
      .string()
      .trim()
      .regex(/^\d{4,8}$/, "HSN codes have 4 to 8 digits."),
    gstRate: z.enum(["0", "5", "12", "18", "28"]).transform(Number),
    mrp: rupees("MRP"),
    price: rupees("price"),
    openingStock: wholeNumber("opening stock", 100_000),
    lowStockLevel: wholeNumber("low-stock level", 10_000),
    lengthMm: optionalMillimetres,
    widthMm: optionalMillimetres,
    heightMm: optionalMillimetres,
    weightGrams: wholeNumber("weight", 500_000),
    warrantyMonths: wholeNumber("warranty", 120),
    specs: z.array(
      z.object({
        label: z.string().trim().min(1, "Enter the spec name.").max(40),
        value: z.string().trim().min(1, "Enter the value.").max(120),
      }),
    ),
    images: z.array(z.union([z.string(), z.instanceof(File)])).max(8, "Add up to 8 images."),
    fitment: z.array(fitmentRowSchema),
    seoTitle: z.string().trim().max(70, "Search engines show about 70 characters."),
    seoDescription: z.string().trim().max(160, "Search engines show about 160 characters."),
    active: z.boolean(),
    installationAvailable: z.boolean(),
    installationCharge: z.string().trim(),
  })
  .refine((values) => values.price <= values.mrp, {
    message: "The price can't be more than the MRP.",
    path: ["price"],
  })
  .refine(
    (values) => {
      const filled = [values.lengthMm, values.widthMm, values.heightMm].filter(Boolean).length
      return filled === 0 || filled === 3
    },
    { message: "Enter all three dimensions, or none.", path: ["lengthMm"] },
  )
  .refine(
    (values) =>
      !values.installationAvailable || /^\d{1,6}(\.\d{1,2})?$/.test(values.installationCharge),
    { message: "Enter the installation charge in rupees.", path: ["installationCharge"] },
  )

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  direction: z.enum(["add", "remove"]),
  quantity: wholeNumber("quantity", 100_000).refine((value) => value > 0, "Enter at least 1."),
  reason: z.enum(
    ["purchase_received", "returned_to_stock", "damaged", "count_correction", "other"],
    "Choose a reason.",
  ),
  note: z.string().trim().min(3, "Add a short note.").max(300),
})

export const importSchema = z.object({
  kind: z.enum(["products", "fitment"]),
  csv: z.string().min(1, "Choose a CSV file."),
})

export type FitmentRow = z.infer<typeof fitmentRowSchema>
export type ProductValues = z.input<typeof productSchema>
/** The product form's control, shared by its section components. */
export type ProductControl = Control<ProductValues, unknown, z.output<typeof productSchema>>
export type StockAdjustmentValues = z.input<typeof stockAdjustmentSchema>

/** What the API receives: images uploaded, money in paise, dimensions combined. */
export type ProductInput = Omit<
  z.output<typeof productSchema>,
  "images" | "lengthMm" | "widthMm" | "heightMm" | "installationCharge"
> & {
  images: string[]
  dimensionsMm: { length: number; width: number; height: number } | null
  installationCharge: number | null
}
export type StockAdjustmentInput = z.output<typeof stockAdjustmentSchema>
