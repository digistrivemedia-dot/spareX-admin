import "server-only"

import type { AuditChange } from "@/features/audit/types"
import type {
  InspectionTemplateInput,
  PartBrandInput,
  ProductCategoryInput,
  ServiceCategoryInput,
  ServiceItemInput,
  VehicleBrandInput,
  VehicleModelInput,
  VehicleTypeInput,
  VehicleVariantInput,
} from "@/features/masters/schemas"
import type {
  InspectionTemplate,
  MasterKind,
  PartBrandListItem,
  ProductCategoryListItem,
  ServiceCategoryListItem,
  ServiceItemListItem,
  VehicleBrandListItem,
  VehicleModelDetail,
  VehicleModelListItem,
  VehicleType,
  VehicleTypeListItem,
} from "@/features/masters/types"
import { ApiError } from "@/lib/api-client"
import type { ActorRef } from "@/lib/types"
import { diffChanges, recordAuditEntry } from "@/mocks/audit"
import { products } from "@/mocks/catalog"
import {
  inspectionTemplates,
  partBrands,
  productCategories,
  serviceCategories,
  serviceItems,
  slugify,
  vehicleBrands,
  vehicleModels,
  vehicleTypes,
  vehicleVariants,
} from "@/mocks/masters"
import { delay, listEndpoint, newId } from "@/mocks/utils"

const isActive = (row: { active: boolean }, value: string) => row.active === (value === "active")

function audit(
  actor: ActorRef,
  action: "create" | "update",
  entityId: string,
  entityLabel: string,
  summary: string,
  changes: AuditChange[] = [],
) {
  recordAuditEntry(actor, { action, entity: "master", entityId, entityLabel, summary, changes })
}

function find<T extends { id: string }>(rows: T[], id: string, label: string): T {
  const row = rows.find((candidate) => candidate.id === id)
  if (!row) throw new ApiError(`${label} not found.`, 404)
  return row
}

/** Names must be unique within their scope (e.g. model names within a brand), as the backend will enforce. */
function assertUniqueName(rows: { id: string; name: string }[], name: string, id: string | null) {
  if (rows.some((row) => row.id !== id && row.name.toLowerCase() === name.toLowerCase())) {
    throw new ApiError("Check the highlighted field.", 422, {
      name: ["This name is already used."],
    })
  }
}

// Vehicle types (A21) — fixed at four (Q-02); only names, descriptions, order and status change.

export const vehicleTypeEndpoint = listEndpoint<VehicleTypeListItem>(
  () =>
    vehicleTypes.map((type) => ({
      ...type,
      brandCount: vehicleBrands.filter((brand) => brand.vehicleTypes.includes(type.id)).length,
      modelCount: vehicleModels.filter((model) => model.vehicleType === type.id).length,
    })),
  {
    searchText: (row) => `${row.name} ${row.description}`,
    filters: { active: isActive },
    sortValues: {
      sortOrder: (row) => row.sortOrder,
      name: (row) => row.name,
      modelCount: (row) => row.modelCount,
    },
  },
)

export async function updateVehicleType(actor: ActorRef, id: string, input: VehicleTypeInput) {
  await delay()
  const record = find(vehicleTypes, id, "Vehicle type")
  const before = { ...record }
  Object.assign(record, input)
  audit(
    actor,
    "update",
    id,
    record.name,
    "Edited vehicle type",
    diffChanges(before, record, {
      name: "Name",
      description: "Description",
      sortOrder: "Order",
      active: "Active",
    }),
  )
  return record
}

// Vehicle brands (A22)

export const vehicleBrandEndpoint = listEndpoint<VehicleBrandListItem>(
  () =>
    vehicleBrands.map((brand) => ({
      ...brand,
      modelCount: vehicleModels.filter((model) => model.brandId === brand.id).length,
    })),
  {
    searchText: (row) => `${row.name} ${row.description}`,
    filters: {
      active: isActive,
      type: (row, value) => row.vehicleTypes.includes(value as VehicleType),
    },
    sortValues: {
      name: (row) => row.name,
      modelCount: (row) => row.modelCount,
      createdAt: (row) => row.createdAt,
    },
  },
)

export async function allVehicleBrands() {
  return vehicleBrands
}

export async function saveVehicleBrand(
  actor: ActorRef,
  id: string | null,
  input: VehicleBrandInput,
) {
  await delay()
  assertUniqueName(vehicleBrands, input.name, id)
  const labels = {
    name: "Name",
    description: "Description",
    vehicleTypes: "Vehicle types",
    logoUrl: "Logo",
    active: "Active",
  } as const
  if (id) {
    const record = find(vehicleBrands, id, "Brand")
    const before = { ...record }
    Object.assign(record, input, { slug: slugify(input.name) })
    audit(
      actor,
      "update",
      id,
      record.name,
      "Edited vehicle brand",
      diffChanges(before, record, labels),
    )
    return record
  }
  const record = {
    id: newId("vb"),
    slug: slugify(input.name),
    createdAt: new Date().toISOString(),
    ...input,
  }
  vehicleBrands.push(record)
  audit(actor, "create", record.id, record.name, "Added vehicle brand")
  return record
}

// Models and variants (A23)

function modelRow(model: (typeof vehicleModels)[number]): VehicleModelListItem {
  const variants = vehicleVariants.filter((variant) => variant.modelId === model.id)
  const years = variants.flatMap((variant) => variant.years)
  return {
    ...model,
    brandName: vehicleBrands.find((brand) => brand.id === model.brandId)?.name ?? "",
    variantCount: variants.length,
    fuels: [...new Set(variants.map((variant) => variant.fuel))],
    yearRange: years.length ? { from: Math.min(...years), to: Math.max(...years) } : null,
  }
}

export const vehicleModelEndpoint = listEndpoint<VehicleModelListItem>(
  () => vehicleModels.map(modelRow),
  {
    searchText: (row) => `${row.brandName} ${row.name}`,
    filters: {
      active: isActive,
      brand: (row, value) => row.brandId === value,
      type: (row, value) => row.vehicleType === value,
      fuel: (row, value) => row.fuels.some((fuel) => fuel === value),
    },
    sortValues: {
      name: (row) => row.name,
      brandName: (row) => `${row.brandName} ${row.name}`,
      variantCount: (row) => row.variantCount,
    },
  },
)

export async function allVehicleModels() {
  return vehicleModels.map(modelRow)
}

export async function getVehicleModel(id: string): Promise<VehicleModelDetail | null> {
  await delay()
  const model = vehicleModels.find((candidate) => candidate.id === id)
  if (!model) return null
  return {
    ...modelRow(model),
    variants: vehicleVariants.filter((variant) => variant.modelId === id),
  }
}

export async function saveVehicleModel(
  actor: ActorRef,
  id: string | null,
  input: VehicleModelInput,
) {
  await delay()
  find(vehicleBrands, input.brandId, "Brand")
  assertUniqueName(
    vehicleModels.filter((model) => model.brandId === input.brandId),
    input.name,
    id,
  )
  if (id) {
    const record = find(vehicleModels, id, "Model")
    const before = { ...record }
    Object.assign(record, input)
    audit(
      actor,
      "update",
      id,
      record.name,
      "Edited vehicle model",
      diffChanges(before, record, { name: "Name", vehicleType: "Vehicle type", active: "Active" }),
    )
    return record
  }
  const record = { id: newId("vm"), ...input }
  vehicleModels.push(record)
  audit(actor, "create", record.id, record.name, "Added vehicle model")
  return record
}

export async function saveVehicleVariant(
  actor: ActorRef,
  id: string | null,
  input: VehicleVariantInput,
) {
  await delay()
  const model = find(vehicleModels, input.modelId, "Model")
  assertUniqueName(
    vehicleVariants.filter((variant) => variant.modelId === input.modelId),
    input.name,
    id,
  )
  const { yearFrom, yearTo, ...rest } = input
  const values = {
    ...rest,
    engineCc: rest.fuel === "electric" ? null : rest.engineCc,
    batteryKwh: rest.fuel === "electric" ? rest.batteryKwh : null,
    years: Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearFrom + i),
  }
  const label = `${model.name} ${input.name}`
  if (id) {
    const record = find(vehicleVariants, id, "Variant")
    const before = { ...record }
    Object.assign(record, values)
    audit(
      actor,
      "update",
      model.id,
      label,
      "Edited variant",
      diffChanges(before, record, {
        name: "Name",
        fuel: "Fuel",
        engineCc: "Engine (cc)",
        batteryKwh: "Battery (kWh)",
        years: "Years",
        active: "Active",
      }),
    )
    return record
  }
  const record = { id: newId("vv"), ...values }
  vehicleVariants.push(record)
  audit(actor, "create", model.id, label, "Added variant")
  return record
}

// Product categories (A24)

export const productCategoryEndpoint = listEndpoint<ProductCategoryListItem>(
  () =>
    productCategories.map((category) => ({
      ...category,
      parentName: productCategories.find((parent) => parent.id === category.parentId)?.name ?? null,
      subcategoryCount: productCategories.filter((child) => child.parentId === category.id).length,
      productCount: products.filter(
        (product) => product.categoryId === category.id || product.subcategoryId === category.id,
      ).length,
    })),
  {
    searchText: (row) => `${row.name} ${row.parentName ?? ""}`,
    filters: {
      active: isActive,
      level: (row, value) => (value === "top" ? row.parentId === null : row.parentId !== null),
      parent: (row, value) => row.parentId === value || row.id === value,
    },
    sortValues: {
      // Keeps subcategories under their parent when sorted by order.
      sortOrder: (row) =>
        row.parentId
          ? `${row.parentName}|${String(row.sortOrder).padStart(3, "0")}`
          : `${row.name}|000`,
      name: (row) => row.name,
      productCount: (row) => row.productCount,
    },
  },
)

export async function topLevelCategories() {
  return productCategories.filter((category) => category.parentId === null)
}

export async function saveProductCategory(
  actor: ActorRef,
  id: string | null,
  input: ProductCategoryInput,
) {
  await delay()
  const { parentId } = input
  if (parentId && parentId === id)
    throw new ApiError("A category can't be its own parent.", 422, {
      parentId: ["Choose another parent."],
    })
  if (id && parentId && productCategories.some((child) => child.parentId === id)) {
    throw new ApiError("Check the highlighted field.", 422, {
      parentId: ["This category has subcategories, so it must stay top-level."],
    })
  }
  assertUniqueName(
    productCategories.filter((category) => category.parentId === parentId),
    input.name,
    id,
  )
  const values = { ...input, parentId, slug: slugify(input.name) }
  if (id) {
    const record = find(productCategories, id, "Category")
    const before = { ...record }
    Object.assign(record, values)
    audit(
      actor,
      "update",
      id,
      record.name,
      "Edited category",
      diffChanges(before, record, {
        name: "Name",
        parentId: "Parent",
        imageUrl: "Image",
        sortOrder: "Order",
        active: "Active",
      }),
    )
    return record
  }
  const record = { id: newId("cat"), ...values }
  productCategories.push(record)
  audit(actor, "create", record.id, record.name, parentId ? "Added subcategory" : "Added category")
  return record
}

// Part brands (A25)

export const partBrandEndpoint = listEndpoint<PartBrandListItem>(
  () =>
    partBrands.map((brand) => ({
      ...brand,
      productCount: products.filter((product) => product.partBrandId === brand.id).length,
    })),
  {
    searchText: (row) => row.name,
    filters: { active: isActive, oem: (row, value) => row.isOem === (value === "yes") },
    sortValues: { name: (row) => row.name, productCount: (row) => row.productCount },
  },
)

export async function allPartBrands() {
  return partBrands
}

export async function savePartBrand(actor: ActorRef, id: string | null, input: PartBrandInput) {
  await delay()
  assertUniqueName(partBrands, input.name, id)
  if (id) {
    const record = find(partBrands, id, "Part brand")
    const before = { ...record }
    Object.assign(record, input, { slug: slugify(input.name) })
    audit(
      actor,
      "update",
      id,
      record.name,
      "Edited part brand",
      diffChanges(before, record, {
        name: "Name",
        isOem: "OEM",
        logoUrl: "Logo",
        active: "Active",
      }),
    )
    return record
  }
  const record = { id: newId("pb"), slug: slugify(input.name), ...input }
  partBrands.push(record)
  audit(actor, "create", record.id, record.name, "Added part brand")
  return record
}

// Service master (A26) — names and categories only; garages set prices (Q-08).

export const serviceCategoryEndpoint = listEndpoint<ServiceCategoryListItem>(
  () =>
    serviceCategories.map((category) => ({
      ...category,
      serviceCount: serviceItems.filter((item) => item.categoryId === category.id).length,
    })),
  {
    searchText: (row) => row.name,
    filters: { active: isActive },
    sortValues: {
      sortOrder: (row) => row.sortOrder,
      name: (row) => row.name,
      serviceCount: (row) => row.serviceCount,
    },
  },
)

export async function allServiceCategories() {
  return serviceCategories
}

export async function saveServiceCategory(
  actor: ActorRef,
  id: string | null,
  input: ServiceCategoryInput,
) {
  await delay()
  assertUniqueName(serviceCategories, input.name, id)
  if (id) {
    const record = find(serviceCategories, id, "Service category")
    const before = { ...record }
    Object.assign(record, input)
    audit(
      actor,
      "update",
      id,
      record.name,
      "Edited service category",
      diffChanges(before, record, { name: "Name", sortOrder: "Order", active: "Active" }),
    )
    return record
  }
  const record = { id: newId("sc"), ...input }
  serviceCategories.push(record)
  audit(actor, "create", record.id, record.name, "Added service category")
  return record
}

export const serviceItemEndpoint = listEndpoint<ServiceItemListItem>(
  () =>
    serviceItems.map((item) => ({
      ...item,
      categoryName:
        serviceCategories.find((category) => category.id === item.categoryId)?.name ?? "",
    })),
  {
    searchText: (row) => `${row.name} ${row.description} ${row.categoryName}`,
    filters: {
      active: isActive,
      category: (row, value) => row.categoryId === value,
      type: (row, value) => row.vehicleTypes.includes(value as VehicleType),
    },
    sortValues: {
      name: (row) => row.name,
      categoryName: (row) => `${row.categoryName} ${row.name}`,
    },
  },
)

export async function saveServiceItem(actor: ActorRef, id: string | null, input: ServiceItemInput) {
  await delay()
  find(serviceCategories, input.categoryId, "Service category")
  assertUniqueName(serviceItems, input.name, id)
  if (id) {
    const record = find(serviceItems, id, "Service")
    const before = { ...record }
    Object.assign(record, input)
    audit(
      actor,
      "update",
      id,
      record.name,
      "Edited service",
      diffChanges(before, record, {
        name: "Name",
        categoryId: "Category",
        description: "Description",
        vehicleTypes: "Vehicle types",
        active: "Active",
      }),
    )
    return record
  }
  const record = { id: newId("sv"), ...input }
  serviceItems.push(record)
  audit(actor, "create", record.id, record.name, "Added service")
  return record
}

// Inspection checklist templates (A27)

export async function getInspectionTemplate(
  vehicleType: VehicleType,
): Promise<InspectionTemplate | null> {
  await delay()
  return inspectionTemplates.find((template) => template.vehicleType === vehicleType) ?? null
}

export async function saveInspectionTemplate(actor: ActorRef, input: InspectionTemplateInput) {
  await delay()
  const template = inspectionTemplates.find(
    (candidate) => candidate.vehicleType === input.vehicleType,
  )
  if (!template) throw new ApiError("Template not found.", 404)
  const count = (sections: InspectionTemplate["sections"]) =>
    sections.reduce((sum, section) => sum + section.items.length, 0)
  const before = count(template.sections)
  template.sections = input.sections.map((section) => ({
    section: section.section,
    items: section.items.map((item) => ({
      id: item.id || newId(input.vehicleType),
      label: item.label,
    })),
  }))
  template.updatedAt = new Date().toISOString()
  audit(
    actor,
    "update",
    template.id,
    `Inspection checklist (${vehicleTypes.find((type) => type.id === input.vehicleType)?.name})`,
    "Edited inspection checklist",
    [{ field: "Checks", before: String(before), after: String(count(template.sections)) }],
  )
  return template
}

// Switching any master record on or off

const ACTIVATABLE: Record<
  MasterKind,
  { rows: { id: string; name: string; active: boolean }[]; label: string }
> = {
  vehicleType: { rows: vehicleTypes, label: "vehicle type" },
  vehicleBrand: { rows: vehicleBrands, label: "vehicle brand" },
  vehicleModel: { rows: vehicleModels, label: "vehicle model" },
  vehicleVariant: { rows: vehicleVariants, label: "variant" },
  productCategory: { rows: productCategories, label: "category" },
  partBrand: { rows: partBrands, label: "part brand" },
  serviceCategory: { rows: serviceCategories, label: "service category" },
  serviceItem: { rows: serviceItems, label: "service" },
}

export async function setMasterActive(
  actor: ActorRef,
  kind: MasterKind,
  id: string,
  active: boolean,
) {
  await delay()
  const { rows, label } = ACTIVATABLE[kind]
  const record = find(rows, id, label)
  if (record.active === active) return record
  record.active = active
  // Variants are audited on their model, so the change shows in the model's activity.
  const variant =
    kind === "vehicleVariant" ? vehicleVariants.find((candidate) => candidate.id === id) : undefined
  const model = variant && vehicleModels.find((candidate) => candidate.id === variant.modelId)
  recordAuditEntry(actor, {
    action: "status_change",
    entity: "master",
    entityId: model?.id ?? id,
    entityLabel: model ? `${model.name} ${record.name}` : record.name,
    summary: `${active ? "Activated" : "Deactivated"} ${label}`,
    changes: [{ field: "Active", before: active ? "No" : "Yes", after: active ? "Yes" : "No" }],
  })
  return record
}
