import { Container } from "@/components/layout/Container"
import { ListSkeleton } from "@/components/ui/ListSkeleton"

export default function ProductsLoading() {
  return (
    <Container>
      <ListSkeleton />
    </Container>
  )
}
