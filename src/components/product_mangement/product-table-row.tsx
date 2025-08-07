'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Id } from 'convex/_generated/dataModel'
import type { Product, Category } from './types'
import type { ProductFormValues } from './schemas'
import { ProductFormSheet } from './product-form-sheet'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

interface ProductTableRowProps {
	product: Product
	categories: Category[]
	getCategoryName: (categoryId: Id<'categories'>) => string
	onUpdate: (id: Id<'products'>, data: ProductFormValues) => void
	onDelete: (id: Id<'products'>) => void
	isMobile?: boolean
}

export function ProductTableRow({
	product,
	categories,
	getCategoryName,
	onUpdate,
	onDelete,
	isMobile = false,
}: ProductTableRowProps) {
	const [showEditSheet, setShowEditSheet] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleSave = (data: ProductFormValues) => {
		onUpdate(product._id, data)
	}

	const handleDelete = () => {
		onDelete(product._id)
	}

	if (isMobile) {
		return (
			<>
				<Card>
					<CardContent className='p-4'>
						<div className='flex justify-between items-start mb-3'>
							<div className='flex-1'>
								<h3 className='font-medium text-lg mb-1'>{product.name}</h3>
								<Badge variant='outline' className='mb-2'>
									{getCategoryName(product.categoryId)}
								</Badge>
							</div>
							<div className='flex items-center gap-2 ml-2'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => setShowEditSheet(true)}
								>
									<Pencil className='h-4 w-4' />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => setShowDeleteDialog(true)}
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-muted-foreground'>Price:</span>
								<p className='font-medium'>
									${product.basePrice.toFixed(2)} / {product.priceType}
								</p>
							</div>
							<div>
								<span className='text-muted-foreground'>Min Qty:</span>
								<p className='font-medium'>{product.minimumQty}</p>
							</div>
							<div>
								<span className='text-muted-foreground'>Lead Time:</span>
								<p className='font-medium'>{product.leadTime}</p>
							</div>
							{product.specialConditions && (
								<div className='col-span-2'>
									<span className='text-muted-foreground'>
										Special Conditions:
									</span>
									<p className='text-sm mt-1'>{product.specialConditions}</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<ProductFormSheet
					open={showEditSheet}
					onOpenChange={setShowEditSheet}
					onSave={handleSave}
					categories={categories}
					defaultValues={product}
				/>

				<DeleteConfirmationDialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}
					title='Delete Product'
					description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
					onConfirm={handleDelete}
				/>
			</>
		)
	}

	return (
		<>
			<TableRow>
				<TableCell className='font-medium'>{product.name}</TableCell>
				<TableCell>
					<Badge variant='outline'>{getCategoryName(product.categoryId)}</Badge>
				</TableCell>
				<TableCell>
					${product.basePrice.toFixed(2)} / {product.priceType}
				</TableCell>
				<TableCell>{product.minimumQty}</TableCell>
				<TableCell>{product.leadTime}</TableCell>
				<TableCell className='text-right'>
					<div className='flex items-center justify-end gap-2'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setShowEditSheet(true)}
						>
							<Pencil className='h-4 w-4' />
						</Button>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setShowDeleteDialog(true)}
						>
							<Trash2 className='h-4 w-4' />
						</Button>
					</div>
				</TableCell>
			</TableRow>

			<ProductFormSheet
				open={showEditSheet}
				onOpenChange={setShowEditSheet}
				onSave={handleSave}
				categories={categories}
				defaultValues={product}
			/>

			<DeleteConfirmationDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title='Delete Product'
				description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
				onConfirm={handleDelete}
			/>
		</>
	)
}
