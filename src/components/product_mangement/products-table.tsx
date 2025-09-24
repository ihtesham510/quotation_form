import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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

export function ProductsTable({ categories, products, onAddProduct }: ProductsTableProps) {
	const [showAddSheet, setShowAddSheet] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [selectedPriceType, setSelectedPriceType] = useState<string>('all')

	const updateProductMutation = useMutation(api.product_categoreis.updateProduct)
	const deleteProductMutation = useMutation(api.product_categoreis.deleteProduct)

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
		return categories.find(cat => cat._id === categoryId)?.name || 'Unknown'
	}

	// Filter and search products
	const filteredProducts = products.filter(product => {
		const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
		const matchesPriceType = selectedPriceType === 'all' || product.priceType === selectedPriceType
		return matchesSearch && matchesCategory && matchesPriceType
	})

	// Statistics for different pricing types
	const pricingStats = {
		total: products.length,
		each: products.filter(p => p.priceType === 'each').length,
		sqm: products.filter(p => p.priceType === 'sqm').length,
		matrix: products.filter(p => p.priceType === 'matrix').length,
		matrixWithEntries: products.filter(p => p.priceType === 'matrix' && p.priceMatrix && p.priceMatrix.length > 0)
			.length,
		matrixWithoutEntries: products.filter(
			p => p.priceType === 'matrix' && (!p.priceMatrix || p.priceMatrix.length === 0),
		).length,
	}

	return (
		<>
			<Card>
				<CardHeader>
					<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
						<div>
							<CardTitle>Products ({filteredProducts.length})</CardTitle>
							<CardDescription>
								Manage your product inventory
								<div className='flex flex-wrap gap-2 mt-2'>
									<Badge variant='secondary' className='text-xs'>
										Per Unit: {pricingStats.each}
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Per SQM: {pricingStats.sqm}
									</Badge>
									<Badge variant='secondary' className='text-xs'>
										Custom Sizes: {pricingStats.matrix}
									</Badge>
									{pricingStats.matrixWithoutEntries > 0 && (
										<Badge variant='destructive' className='text-xs'>
											Matrix Missing: {pricingStats.matrixWithoutEntries}
										</Badge>
									)}
								</div>
							</CardDescription>
						</div>
						<Button onClick={() => setShowAddSheet(true)} className='w-full sm:w-auto'>
							<Plus className='h-4 w-4 mr-2' />
							Add Product
						</Button>
					</div>
				</CardHeader>

				{/* Filters */}
				<div className='px-6 space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
							<Input
								placeholder='Search products...'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>

						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Filter by category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{categories.map(category => (
									<SelectItem key={category._id} value={category._id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={selectedPriceType} onValueChange={setSelectedPriceType}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Filter by price type' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Price Types</SelectItem>
								<SelectItem value='each'>Per Unit</SelectItem>
								<SelectItem value='sqm'>Per SQM</SelectItem>
								<SelectItem value='matrix'>Custom Sizes</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{(searchTerm || selectedCategory !== 'all' || selectedPriceType !== 'all') && (
						<div className='flex items-center gap-2'>
							<span className='text-sm text-muted-foreground'>Active filters:</span>
							{searchTerm && (
								<Badge variant='outline' className='text-xs'>
									Search: "{searchTerm}"
								</Badge>
							)}
							{selectedCategory !== 'all' && (
								<Badge variant='outline' className='text-xs'>
									Category: {getCategoryName(selectedCategory as Id<'categories'>)}
								</Badge>
							)}
							{selectedPriceType !== 'all' && (
								<Badge variant='outline' className='text-xs'>
									Type: {selectedPriceType}
								</Badge>
							)}
							<Button
								variant='ghost'
								size='sm'
								onClick={() => {
									setSearchTerm('')
									setSelectedCategory('all')
									setSelectedPriceType('all')
								}}
								className='text-xs h-auto p-1'
							>
								Clear all
							</Button>
						</div>
					)}
				</div>

				<CardContent className='p-0 sm:p-6'>
					{filteredProducts.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>
							<p className='text-lg mb-2'>
								{products.length === 0 ? 'No products found' : 'No products match your filters'}
							</p>
							<p className='text-sm'>
								{products.length === 0
									? 'Add your first product to get started'
									: 'Try adjusting your search or filters'}
							</p>
						</div>
					) : (
						<>
							{/* Desktop Table View */}
							<div className='hidden lg:block'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Pricing</TableHead>
											<TableHead>Min Qty</TableHead>
											<TableHead>Lead Time</TableHead>
											<TableHead className='text-right'>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredProducts.map(product => (
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
							<div className='lg:hidden space-y-4 p-4'>
								{filteredProducts.map(product => (
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
						</>
					)}
				</CardContent>
			</Card>

			<ProductFormSheet
				open={showAddSheet}
				onOpenChange={setShowAddSheet}
				onSave={onAddProduct}
				categories={categories}
			/>
		</>
	)
}
