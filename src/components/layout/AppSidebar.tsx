import { DesktopSidebar } from "@/components/layout/DesktopSidebar"
import { requireSession } from "@/features/auth/session"

/** Reads the session on the server so the menu only lists what the admin may open. */
export async function AppSidebar() {
  const session = await requireSession()
  return <DesktopSidebar permissions={session.permissions} />
}
