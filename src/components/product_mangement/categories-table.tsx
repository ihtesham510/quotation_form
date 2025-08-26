import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Id } from 'convex/_generated/dataModel'
import type { Category, Product } from './types'
import type { CategoryFormValues } from './schemas'
import { CategoryFormSheet } from './category-form-sheet'
import { CategoryTableRow } from './category-table-row'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth'

interface CategoriesTableProps {
	categories: Category[]
	products: Product[]
	onAddCategory: (data: CategoryFormValues) => void
}

export function CategoriesTable({ categories, products, onAddCategory }: CategoriesTableProps) {
	const isMobile = useIsMobile()
	const [showAddSheet, setShowAddSheet] = useState(false)
	const updateCategoryMutation = useMutation(api.product_categoreis.updateCategory)
	const deleteCategoryMutation = useMutation(api.product_categoreis.deleteCategory)

	const handleAdd = (data: CategoryFormValues) => {
		onAddCategory(data)
	}

	const handleUpdate = async (id: Id<'categories'>, data: CategoryFormValues) => {
		const { user } = useAuth()
		try {
			await updateCategoryMutation({
				userId: user!._id,
				categoryId: id,
				name: data.title,
				description: data.description,
			})

			toast.success('Updated Successfully')
		} catch (err) {
			console.log(err)
			toast.error('Error while updating')
		}
	}

	const handleDelete = async (id: Id<'categories'>) => {
		try {
			await deleteCategoryMutation({ categoryId: id })
			toast.success('Deleted Successfully')
		} catch (err) {
			console.log(err)
			toast.error('Error while deleting')
		}
	}

	const getProductCount = (categoryId: Id<'categories'>) => {
		return products.filter(p => p.categoryId === categoryId).length
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
						<div>
							<CardTitle>Categories</CardTitle>
							<CardDescription>Manage product categories</CardDescription>
						</div>
						<Button onClick={() => setShowAddSheet(true)} className='w-full sm:w-auto'>
							<Plus className='h-4 w-4 mr-2' />
							Add Category
						</Button>
					</div>
				</CardHeader>
				<CardContent className='p-0 sm:p-6'>
					{/* Desktop Table View */}
					<div className='hidden md:block'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Products</TableHead>
									<TableHead className='text-right'>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories.map(category => (
									<CategoryTableRow
										key={category._id}
										category={category}
										productCount={getProductCount(category._id)}
										onUpdate={handleUpdate}
										onDelete={handleDelete}
									/>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View */}
					<div className='md:hidden space-y-4 p-4'>
						{categories.map(category => (
							<CategoryTableRow
								key={category._id}
								category={category}
								productCount={getProductCount(category._id)}
								onUpdate={handleUpdate}
								onDelete={handleDelete}
								isMobile={isMobile}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<CategoryFormSheet open={showAddSheet} onOpenChange={setShowAddSheet} onSave={handleAdd} />
		</>
	)
}
