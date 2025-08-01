import { LoaderComponent } from '@/components/loader-component'
import { ProductCategoryManager } from '@/components/product_mangement'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { Suspense } from 'react'

export const Route = createFileRoute('/dashboard/products/')({
  component: () => (
    <Suspense fallback={<LoaderComponent />}>
      <RouteComponent />
    </Suspense>
  ),
})

function RouteComponent() {
  const data = useQuery(api.product_categoreis.getProductAndCategories)
  return (
    <div>
      {data && (
        <ProductCategoryManager
          categories={data.categories}
          products={data.products}
        />
      )}
    </div>
  )
}
