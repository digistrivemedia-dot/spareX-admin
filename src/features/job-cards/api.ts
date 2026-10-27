import "server-only"

import type { JobCard } from "@/features/job-cards/types"
import { apiClient } from "@/lib/api-client"
import { listEndpoint } from "@/lib/api-endpoint"
import { dataSource } from "@/lib/config"
import * as mock from "@/mocks/service-api"

export const jobCardsApi = listEndpoint<JobCard>(
  dataSource.jobCards,
  "/job-cards",
  mock.jobCardEndpoint,
)

export async function getJobCard(token: string, id: string): Promise<JobCard | null> {
  return dataSource.jobCards === "mock"
    ? mock.getJobCard(id)
    : apiClient.get(`/job-cards/${id}`, { token })
}
