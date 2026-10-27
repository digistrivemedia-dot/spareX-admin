import type { Metadata } from "next"

import { Container } from "@/components/layout/Container"
import { DetailLayout } from "@/components/layout/DetailLayout"
import { Badge } from "@/components/ui/badge"
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm"
import { MyActivity } from "@/features/auth/components/MyActivity"
import { ProfileDetailsForm } from "@/features/auth/components/ProfileDetailsForm"
import { TwoStepSetting } from "@/features/auth/components/TwoStepSetting"
import { requireSession } from "@/features/auth/session"
import { formatDateTime, formatPhone } from "@/lib/format"

export const metadata: Metadata = { title: "My profile" }

const TABS = [
  { id: "details", label: "Details" },
  { id: "security", label: "Password and 2-step" },
  { id: "activity", label: "My activity" },
]

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const query = await searchParams
  const { user, role } = await requireSession()
  const tab = TABS.some((item) => item.id === query.tab) ? String(query.tab) : "details"

  return (
    <Container>
      <DetailLayout
        title={user.name}
        status={<Badge variant="secondary">{role.name}</Badge>}
        facts={[
          { label: "Email", value: user.email },
          { label: "Mobile", value: formatPhone(user.phone) },
          {
            label: "Last sign-in",
            value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "–",
          },
        ]}
        tabs={{ items: TABS, active: tab, basePath: "/profile" }}
      >
        {tab === "details" && (
          <ProfileDetailsForm name={user.name} phone={user.phone} email={user.email} />
        )}
        {tab === "security" && (
          <>
            <TwoStepSetting
              enabled={user.twoStepEnabled}
              required={role.twoStepRequired}
              roleName={role.name}
              phone={user.phone}
            />
            <ChangePasswordForm />
          </>
        )}
        {tab === "activity" && <MyActivity searchParams={query} userId={user.id} />}
      </DetailLayout>
    </Container>
  )
}
