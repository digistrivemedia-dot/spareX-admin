import { listAuditEntries } from "@/features/audit/api"
import { MY_ACTIVITY_FILTERS } from "@/features/audit/utils"
import { MyActivityTable } from "@/features/auth/components/MyActivityTable"
import { requireToken } from "@/features/auth/session"
import { parseListParams, type SearchParams } from "@/lib/list-params"

/** Loads the signed-in admin's own audit entries with the search, filters and page in the URL. */
export async function MyActivity({
  searchParams,
  userId,
}: {
  searchParams: SearchParams
  userId: string
}) {
  const params = parseListParams(searchParams, {
    filterKeys: MY_ACTIVITY_FILTERS,
    defaultSort: { field: "at", direction: "desc" },
  })
  const data = await listAuditEntries(await requireToken(), {
    ...params,
    filters: { ...params.filters, actor: userId },
  })
  return <MyActivityTable data={data} />
}
