import { z } from "zod"

import { TOP_LEVEL } from "@/features/masters/utils"

const name = z.string().trim().min(2, "Enter a name.").max(80, "Keep it under 80 characters.")
const description = z.string().trim().max(400, "Keep it under 400 characters.")
const vehicleType = z.enum(["bike", "scooter", "car", "commercial"], "Choose a vehicle type.")
const vehicleTypes = z.array(vehicleType).min(1, "Choose at least one vehicle type.")
const image = z.union([z.string(), z.instanceof(File), z.null()])

/** Number inputs arrive as text; empty means "not set". */
const optionalNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (/^\d+(\.\d+)?$/.test(value) && Number(value) <= max),
      `Enter a valid ${label}.`,
    )
    .transform((value) => (value === "" ? null : Number(value)))

const sortOrder = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, "Enter a number from 0 to 999.")
  .transform(Number)

const thisYear = new Date().getFullYear()
const modelYear = z
  .string()
  .regex(/^\d{4}$/, "Enter a 4-digit year.")
  .transform(Number)
  .refine(
    (year) => year >= 1980 && year <= thisYear + 1,
    `Use a year from 1980 to ${thisYear + 1}.`,
  )

export const vehicleTypeSchema = z.object({ name, description, sortOrder, active: z.boolean() })

export const vehicleBrandSchema = z.object({
  name,
  description,
  vehicleTypes,
  logo: image,
  active: z.boolean(),
})

export const vehicleModelSchema = z.object({
  brandId: z.string().min(1, "Choose a brand."),
  name,
  vehicleType,
  active: z.boolean(),
})

export const vehicleVariantSchema = z
  .object({
    modelId: z.string().min(1),
    name,
    fuel: z.enum(["petrol", "diesel", "cng", "electric", "hybrid"], "Choose a fuel."),
    engineCc: optionalNumber("engine size", 10000),
    batteryKwh: optionalNumber("battery size", 500),
    yearFrom: modelYear,
    yearTo: modelYear,
    active: z.boolean(),
  })
  .refine((values) => values.yearTo >= values.yearFrom, {
    message: "The last year can't be before the first.",
    path: ["yearTo"],
  })
  .refine(
    (values) =>
      values.fuel === "electric" ? values.batteryKwh !== null : values.engineCc !== null,
    {
      message: "Enter the engine size (cc), or the battery size (kWh) for electric.",
      path: ["engineCc"],
    },
  )

export const productCategorySchema = z.object({
  name,
  /** `TOP_LEVEL` in the form; null for a top-level category once parsed. */
  parentId: z.string().transform((value) => (value === TOP_LEVEL ? null : value)),
  image,
  sortOrder,
  active: z.boolean(),
})

export const partBrandSchema = z.object({
  name,
  isOem: z.boolean(),
  logo: image,
  active: z.boolean(),
})

export const serviceCategorySchema = z.object({ name, sortOrder, active: z.boolean() })

export const serviceItemSchema = z.object({
  categoryId: z.string().min(1, "Choose a category."),
  name,
  description,
  vehicleTypes,
  active: z.boolean(),
})

export const inspectionTemplateSchema = z.object({
  vehicleType,
  sections: z.array(
    z.object({
      section: z.enum([
        "engine",
        "brakes",
        "tyres",
        "battery",
        "suspension",
        "lights",
        "ac",
        "electricals",
        "fluids",
        "body",
      ]),
      items: z
        .array(
          z.object({ id: z.string(), label: z.string().trim().min(2, "Enter the check.").max(80) }),
        )
        .min(1, "Each section needs at least one check."),
    }),
  ),
})

export type VehicleTypeValues = z.input<typeof vehicleTypeSchema>
export type VehicleBrandValues = z.input<typeof vehicleBrandSchema>
export type VehicleModelValues = z.input<typeof vehicleModelSchema>
export type VehicleVariantValues = z.input<typeof vehicleVariantSchema>
export type ProductCategoryValues = z.input<typeof productCategorySchema>
export type PartBrandValues = z.input<typeof partBrandSchema>
export type ServiceCategoryValues = z.input<typeof serviceCategorySchema>
export type ServiceItemValues = z.input<typeof serviceItemSchema>
export type InspectionTemplateValues = z.input<typeof inspectionTemplateSchema>

/** What the API receives once images are uploaded and numbers parsed. */
export type VehicleTypeInput = z.output<typeof vehicleTypeSchema>
export type VehicleBrandInput = Omit<z.output<typeof vehicleBrandSchema>, "logo"> & {
  logoUrl: string | null
}
export type VehicleModelInput = z.output<typeof vehicleModelSchema>
export type VehicleVariantInput = z.output<typeof vehicleVariantSchema>
export type ProductCategoryInput = Omit<z.output<typeof productCategorySchema>, "image"> & {
  imageUrl: string | null
}
export type PartBrandInput = Omit<z.output<typeof partBrandSchema>, "logo"> & {
  logoUrl: string | null
}
export type ServiceCategoryInput = z.output<typeof serviceCategorySchema>
export type ServiceItemInput = z.output<typeof serviceItemSchema>
export type InspectionTemplateInput = z.output<typeof inspectionTemplateSchema>
