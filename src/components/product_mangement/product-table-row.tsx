'use client'

import { useState } from 'react'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Table, TableBody, TableHead, TableHeader, TableRow as MatrixTableRow } from '@/components/ui/table'
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

function PriceDisplay({ product }: { product: Product }) {
	if (product.priceType === 'matrix') {
		const matrixCount = product.priceMatrix?.length || 0
		const priceRange =
			product.priceMatrix && product.priceMatrix.length > 0
				? `$${Math.min(...product.priceMatrix.map(m => m.price)).toFixed(2)} - $${Math.max(...product.priceMatrix.map(m => m.price)).toFixed(2)}`
				: 'No pricing'

		return (
			<div className='space-y-1'>
				<div className='text-sm font-medium'>Sizes ({matrixCount} sizes)</div>
				<div className='text-xs text-muted-foreground'>{priceRange}</div>
			</div>
		)
	}

	return (
		<div>
			${product.basePrice.toFixed(2)} / {product.priceType}
		</div>
	)
}

function MatrixPricingDialog({ product }: { product: Product }) {
	if (product.priceType !== 'matrix' || !product.priceMatrix || product.priceMatrix.length === 0) {
		return null
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm'>
					<Eye className='h-4 w-4 mr-1' />
					View Sizes
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Price Matrix - {product.name}</DialogTitle>
					<DialogDescription>All available sizes and their corresponding prices</DialogDescription>
				</DialogHeader>
				<div className='max-h-96 overflow-y-auto'>
					<Table>
						<TableHeader>
							<MatrixTableRow>
								<TableHead>Width (m)</TableHead>
								<TableHead>Height (m)</TableHead>
								<TableHead>Area (m²)</TableHead>
								<TableHead className='text-right'>Price</TableHead>
							</MatrixTableRow>
						</TableHeader>
						<TableBody>
							{product.priceMatrix.map((matrix, index) => (
								<MatrixTableRow key={index}>
									<TableCell>{matrix.width}</TableCell>
									<TableCell>{matrix.height}</TableCell>
									<TableCell>{(matrix.width * matrix.height).toFixed(2)}</TableCell>
									<TableCell className='text-right font-medium'>${matrix.price.toFixed(2)}</TableCell>
								</MatrixTableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	)
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
								<Button variant='ghost' size='sm' onClick={() => setShowEditSheet(true)}>
									<Pencil className='h-4 w-4' />
								</Button>
								<Button variant='ghost' size='sm' onClick={() => setShowDeleteDialog(true)}>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-muted-foreground'>Price:</span>
								<div className='font-medium'>
									<PriceDisplay product={product} />
								</div>
							</div>
							<div>
								<span className='text-muted-foreground'>Min Qty:</span>
								<p className='font-medium'>{product.minimumQty}</p>
							</div>
							<div>
								<span className='text-muted-foreground'>Lead Time:</span>
								<p className='font-medium'>{product.leadTime}</p>
							</div>
							<div>
								<span className='text-muted-foreground'>Price Type:</span>
								<p className='font-medium capitalize'>{product.priceType}</p>
							</div>
						</div>

						{product.priceType === 'matrix' && (
							<div className='mt-4 pt-3 border-t'>
								<MatrixPricingDialog product={product} />
							</div>
						)}

						{product.specialConditions && (
							<div className='mt-4 pt-3 border-t'>
								<span className='text-muted-foreground text-sm'>Special Conditions:</span>
								<p className='text-sm mt-1'>{product.specialConditions}</p>
							</div>
						)}
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
				<TableCell className='font-medium'>
					<div>
						<div>{product.name}</div>
						{product.priceType === 'matrix' && product.priceMatrix && product.priceMatrix.length > 0 && (
							<div className='text-xs text-muted-foreground mt-1'>{product.priceMatrix.length} matrix entries</div>
						)}
					</div>
				</TableCell>
				<TableCell>
					<Badge variant='outline'>{getCategoryName(product.categoryId)}</Badge>
				</TableCell>
				<TableCell>
					<PriceDisplay product={product} />
				</TableCell>
				<TableCell>{product.minimumQty}</TableCell>
				<TableCell>{product.leadTime}</TableCell>
				<TableCell className='text-right'>
					<div className='flex items-center justify-end gap-2'>
						{product.priceType === 'matrix' && <MatrixPricingDialog product={product} />}
						<Button variant='ghost' size='sm' onClick={() => setShowEditSheet(true)}>
							<Pencil className='h-4 w-4' />
						</Button>
						<Button variant='ghost' size='sm' onClick={() => setShowDeleteDialog(true)}>
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
