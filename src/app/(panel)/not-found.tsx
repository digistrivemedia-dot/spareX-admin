import { Container } from "@/components/layout/Container"
import { PageNotFound } from "@/components/layout/PageNotFound"

/** 404 inside the app shell, so a mistyped address doesn't lose the menu. */
export default function PanelNotFound() {
  return (
    <Container>
      <div className="rounded-xl border border-gray-200 bg-card shadow-sm">
        <PageNotFound />
      </div>
    </Container>
  )
}
