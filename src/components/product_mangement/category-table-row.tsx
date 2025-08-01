import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Id } from 'convex/_generated/dataModel'
import type { Category } from './types'
import type { CategoryFormValues } from './schemas'
import { CategoryFormSheet } from './category-form-sheet'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

interface CategoryTableRowProps {
  category: Category
  productCount: number
  onUpdate: (id: Id<'categories'>, data: CategoryFormValues) => void
  onDelete: (id: Id<'categories'>) => void
  isMobile?: boolean
}

export function CategoryTableRow({
  category,
  productCount,
  onUpdate,
  onDelete,
  isMobile = false,
}: CategoryTableRowProps) {
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSave = (data: CategoryFormValues) => {
    onUpdate(category._id, data)
  }

  const handleDelete = () => {
    onDelete(category._id)
  }

  if (isMobile) {
    return (
      <>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{category.name}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditSheet(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {category.description}
            </p>
            <Badge variant="secondary">{productCount} products</Badge>
          </CardContent>
        </Card>

        <CategoryFormSheet
          open={showEditSheet}
          onOpenChange={setShowEditSheet}
          onSave={handleSave}
          defaultValues={category}
        />

        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Category"
          description={`Are you sure you want to delete "${category.name}"? This will also delete all products in this category. This action cannot be undone.`}
          onConfirm={handleDelete}
        />
      </>
    )
  }

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{category.name}</TableCell>
        <TableCell>{category.description}</TableCell>
        <TableCell>
          <Badge variant="secondary">{productCount} products</Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditSheet(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <CategoryFormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSave={handleSave}
        defaultValues={category}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.name}"? This will also delete all products in this category. This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
