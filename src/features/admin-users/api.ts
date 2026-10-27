import "server-only"

import type { AdminUserInput } from "@/features/admin-users/schemas"
import type { AdminUser } from "@/features/admin-users/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import type { RequestContext } from "@/lib/types"
import * as mock from "@/mocks/admin-users-api"

const useMock = dataSource.adminUsers === "mock"

export const adminUsersApi = listEndpoint<AdminUser>(
  dataSource.adminUsers,
  "/admin-users",
  mock.adminUserEndpoint,
)

/** Every admin, for the audit log's "Who" filter. */
export async function getAdminOptions(token: string): Promise<{ id: string; name: string }[]> {
  return useMock ? mock.adminOptions() : apiClient.get("/admin-users/options", { token })
}

export async function saveAdminUser(
  { actor, token }: RequestContext,
  id: string | null,
  input: AdminUserInput,
) {
  if (useMock) return mock.saveAdminUser(actor, id, input)
  return id
    ? apiClient.patch(`/admin-users/${id}`, input, { token })
    : apiClient.post("/admin-users/invite", input, { token })
}

export async function setAdminUserActive(
  { actor, token }: RequestContext,
  id: string,
  active: boolean,
) {
  if (useMock) return mock.setAdminUserActive(actor, id, active)
  return apiClient.post(`/admin-users/${id}/${active ? "activate" : "deactivate"}`, {}, { token })
}
