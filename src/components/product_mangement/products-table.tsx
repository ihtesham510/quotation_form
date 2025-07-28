import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Id } from 'convex/_generated/dataModel'
import type { Category, Product } from './types'
import type { ProductFormValues } from './schemas'
import { ProductFormSheet } from './product-form-sheet'
import { ProductTableRow } from './product-table-row'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'

interface ProductsTableProps {
  categories: Category[]
  products: Product[]
  onAddProduct: (data: ProductFormValues) => void
}

export function ProductsTable({
  categories,
  products,
  onAddProduct,
}: ProductsTableProps) {
  const [showAddSheet, setShowAddSheet] = useState(false)
  const updateProductMutation = useMutation(
    api.product_categoreis.updateProduct,
  )
  const deleteProductMutation = useMutation(
    api.product_categoreis.deleteProduct,
  )

  const handleAdd = async (data: ProductFormValues) => {
    onAddProduct(data)
  }

  const handleUpdate = async (id: Id<'products'>, data: ProductFormValues) => {
    try {
      await updateProductMutation({
        ...data,
        productId: id,
        categoryId: data.categoryId as Id<'categories'>,
      })
      toast.success('Updated Successfully')
    } catch (err) {
      console.log(err)
      toast.error('Error while updating product')
    }
  }

  const handleDelete = async (id: Id<'products'>) => {
    try {
      await deleteProductMutation({ productId: id })
      toast.success('Deleted Successfully')
    } catch (err) {
      console.log(err)
      toast.error('Error while Deleting product')
    }
  }

  const getCategoryName = (categoryId: Id<'categories'>) => {
    return categories.find((cat) => cat._id === categoryId)?.title || 'Unknown'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </div>
            <Button
              onClick={() => setShowAddSheet(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Min Qty</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <ProductTableRow
                    key={product._id}
                    product={product}
                    categories={categories}
                    getCategoryName={getCategoryName}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 p-4">
            {products.map((product) => (
              <ProductTableRow
                key={product._id}
                product={product}
                categories={categories}
                getCategoryName={getCategoryName}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                isMobile={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <ProductFormSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSave={handleAdd}
        categories={categories}
      />
    </>
  )
}
