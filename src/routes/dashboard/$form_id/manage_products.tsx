import { LoaderComponent } from '@/components/loader-component'
import { ProductCategoryManager } from '@/components/product_mangement'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/dashboard/$form_id/manage_products')({
  component: RouteComponent,
})

function RouteComponent() {
  const data = useQuery(api.product_categoreis.getProductAndCategories)
  const { form_id } = Route.useParams()
  if (!data) return <LoaderComponent />
  return (
    <div className="grid">
      <Link to="/dashboard/$form_id" params={{ form_id }}>
        <Button
          variant="outline"
          className="flex gap-2 max-w-[130px] ml-6 mt-4"
        >
          <ArrowLeftIcon className="size-4" />
          <p className="hidden md:inline-flex">Go Back</p>
        </Button>
      </Link>
      <ProductCategoryManager
        categories={data.categories}
        products={data.products}
      />
    </div>
  )
}
