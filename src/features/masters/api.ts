import "server-only"

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
  PartBrand,
  PartBrandListItem,
  ProductCategory,
  ProductCategoryListItem,
  ServiceCategory,
  ServiceCategoryListItem,
  ServiceItemListItem,
  VehicleBrand,
  VehicleBrandListItem,
  VehicleModel,
  VehicleModelDetail,
  VehicleModelListItem,
  VehicleType,
  VehicleTypeListItem,
} from "@/features/masters/types"
import { apiClient } from "@/lib/api-client"
import { dataSource } from "@/lib/config"
import { listEndpoint } from "@/lib/api-endpoint"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/masters-api"

const useMock = dataSource.masters === "mock"

export const vehicleTypesApi = listEndpoint<VehicleTypeListItem>(
  dataSource.masters,
  "/masters/vehicle-types",
  mock.vehicleTypeEndpoint,
)
export const vehicleBrandsApi = listEndpoint<VehicleBrandListItem>(
  dataSource.masters,
  "/masters/vehicle-brands",
  mock.vehicleBrandEndpoint,
)
export const vehicleModelsApi = listEndpoint<VehicleModelListItem>(
  dataSource.masters,
  "/masters/vehicle-models",
  mock.vehicleModelEndpoint,
)
export const productCategoriesApi = listEndpoint<ProductCategoryListItem>(
  dataSource.masters,
  "/masters/categories",
  mock.productCategoryEndpoint,
)
export const partBrandsApi = listEndpoint<PartBrandListItem>(
  dataSource.masters,
  "/masters/part-brands",
  mock.partBrandEndpoint,
)
export const serviceCategoriesApi = listEndpoint<ServiceCategoryListItem>(
  dataSource.masters,
  "/masters/service-categories",
  mock.serviceCategoryEndpoint,
)
export const serviceItemsApi = listEndpoint<ServiceItemListItem>(
  dataSource.masters,
  "/masters/services",
  mock.serviceItemEndpoint,
)

/** Option lists for selects and filters. */
export async function getVehicleBrandOptions(token: string): Promise<VehicleBrand[]> {
  return useMock
    ? mock.allVehicleBrands()
    : apiClient.get("/masters/vehicle-brands/options", { token })
}

export async function getVehicleModelOptions(token: string): Promise<VehicleModelListItem[]> {
  return useMock
    ? mock.allVehicleModels()
    : apiClient.get("/masters/vehicle-models/options", { token })
}

export async function getTopLevelCategories(token: string): Promise<ProductCategory[]> {
  return useMock
    ? mock.topLevelCategories()
    : apiClient.get("/masters/categories/options", { token })
}

export async function getPartBrandOptions(token: string): Promise<PartBrand[]> {
  return useMock ? mock.allPartBrands() : apiClient.get("/masters/part-brands/options", { token })
}

export async function getServiceCategoryOptions(token: string): Promise<ServiceCategory[]> {
  return useMock
    ? mock.allServiceCategories()
    : apiClient.get("/masters/service-categories/options", { token })
}

export async function getVehicleModel(
  token: string,
  id: string,
): Promise<VehicleModelDetail | null> {
  return useMock
    ? mock.getVehicleModel(id)
    : apiClient.get(`/masters/vehicle-models/${id}`, { token })
}

export async function getInspectionTemplate(
  token: string,
  vehicleType: VehicleType,
): Promise<InspectionTemplate | null> {
  return useMock
    ? mock.getInspectionTemplate(vehicleType)
    : apiClient.get(`/masters/inspection-templates/${vehicleType}`, { token })
}

/** Creates when `id` is null, otherwise updates. */
function save<TResult>(
  context: RequestContext,
  path: string,
  id: string | null,
  input: unknown,
): Promise<TResult> {
  const options = { token: context.token }
  return id
    ? apiClient.patch<TResult>(`${path}/${id}`, input, options)
    : apiClient.post<TResult>(path, input, options)
}

export async function updateVehicleType(
  context: RequestContext,
  id: string,
  input: VehicleTypeInput,
) {
  return useMock
    ? mock.updateVehicleType(context.actor, id, input)
    : save(context, "/masters/vehicle-types", id, input)
}

export async function saveVehicleBrand(
  context: RequestContext,
  id: string | null,
  input: VehicleBrandInput,
) {
  return useMock
    ? mock.saveVehicleBrand(context.actor, id, input)
    : save(context, "/masters/vehicle-brands", id, input)
}

export async function saveVehicleModel(
  context: RequestContext,
  id: string | null,
  input: VehicleModelInput,
): Promise<VehicleModel> {
  return useMock
    ? mock.saveVehicleModel(context.actor, id, input)
    : save(context, "/masters/vehicle-models", id, input)
}

export async function saveVehicleVariant(
  context: RequestContext,
  id: string | null,
  input: VehicleVariantInput,
) {
  return useMock
    ? mock.saveVehicleVariant(context.actor, id, input)
    : save(context, "/masters/vehicle-variants", id, input)
}

export async function saveProductCategory(
  context: RequestContext,
  id: string | null,
  input: ProductCategoryInput,
) {
  return useMock
    ? mock.saveProductCategory(context.actor, id, input)
    : save(context, "/masters/categories", id, input)
}

export async function savePartBrand(
  context: RequestContext,
  id: string | null,
  input: PartBrandInput,
) {
  return useMock
    ? mock.savePartBrand(context.actor, id, input)
    : save(context, "/masters/part-brands", id, input)
}

export async function saveServiceCategory(
  context: RequestContext,
  id: string | null,
  input: ServiceCategoryInput,
) {
  return useMock
    ? mock.saveServiceCategory(context.actor, id, input)
    : save(context, "/masters/service-categories", id, input)
}

export async function saveServiceItem(
  context: RequestContext,
  id: string | null,
  input: ServiceItemInput,
) {
  return useMock
    ? mock.saveServiceItem(context.actor, id, input)
    : save(context, "/masters/services", id, input)
}

export async function saveInspectionTemplate(
  context: RequestContext,
  input: InspectionTemplateInput,
) {
  return useMock
    ? mock.saveInspectionTemplate(context.actor, input)
    : apiClient.patch(`/masters/inspection-templates/${input.vehicleType}`, input, {
        token: context.token,
      })
}

export async function setMasterActive(
  context: RequestContext,
  kind: MasterKind,
  id: string,
  active: boolean,
) {
  return useMock
    ? mock.setMasterActive(context.actor, kind, id, active)
    : apiClient.patch(`/masters/${kind}/${id}/active`, { active }, { token: context.token })
}
