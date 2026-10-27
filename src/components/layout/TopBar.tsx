import { GlobalSearch } from "@/components/layout/GlobalSearch"
import { MobileNav } from "@/components/layout/MobileNav"
import { NotificationsMenu } from "@/components/layout/NotificationsMenu"
import { ProfileMenu } from "@/components/layout/ProfileMenu"
import { requireSession } from "@/features/auth/session"

export async function TopBar() {
  const { user, role, permissions } = await requireSession()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:gap-4 sm:px-6 lg:px-8">
      <MobileNav permissions={permissions} />
      <div className="min-w-0 flex-1">
        <GlobalSearch permissions={permissions} />
      </div>
      <NotificationsMenu />
      <ProfileMenu name={user.name} email={user.email} roleName={role.name} />
    </header>
  )
}
