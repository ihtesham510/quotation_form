import { Package, Tag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Category, Product } from './types'
import type { CategoryFormValues, ProductFormValues } from './schemas'
import { CategoriesTable } from './categories-table'
import { ProductsTable } from './products-table'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'

export function ProductCategoryManager({
  products,
  categories,
}: {
  categories: Category[]
  products: Product[]
}) {
  const addProductMutation = useMutation(api.product_categoreis.addProduct)
  const addCategoryMutation = useMutation(api.product_categoreis.addCategory)
  const handleAddCategory = async (data: CategoryFormValues) => {
    try {
      await addCategoryMutation({
        name: data.title,
        description: data.description,
      })
      toast.success('Category added Successfully')
      console.log('Add category:', data)
    } catch (err) {
      toast.error('Error while adding category')
      console.log(err)
    }
  }

  const handleAddProduct = async (data: ProductFormValues) => {
    try {
      await addProductMutation({
        ...data,
        categoryId: data.categoryId as Id<'categories'>,
      })
      toast.success('Product added Successfully')
      console.log('Add product:', data)
    } catch (err) {
      toast.error('Error while adding product')
      console.log(err)
    }
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product & Category Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and categories
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <CategoriesTable
            categories={categories}
            products={products}
            onAddCategory={handleAddCategory}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductsTable
            categories={categories}
            products={products}
            onAddProduct={handleAddProduct}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
