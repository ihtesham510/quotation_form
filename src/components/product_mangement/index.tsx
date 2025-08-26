import React from 'react'
import { Download, Package, Tag, Upload } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Category, Product } from './types'
import type { CategoryFormValues, ProductFormValues } from './schemas'
import { CategoriesTable } from './categories-table'
import { ProductsTable } from './products-table'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useAuth } from '@/context/auth'

export function ProductCategoryManager({
	products,
	categories,
	onImportData,
	onExportData,
}: {
	categories: Category[]
	products: Product[]
	onImportData: (file: File) => void
	onExportData: () => void
}) {
	const { user } = useAuth()
	const addProductMutation = useMutation(api.product_categoreis.addProduct)
	const addCategoryMutation = useMutation(api.product_categoreis.addCategory)
	const handleAddCategory = async (data: CategoryFormValues) => {
		try {
			await addCategoryMutation({
				userId: user!._id,
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
	const fileInputRef = React.useRef<HTMLInputElement>(null) // Ref for hidden file input

	const handleImportButtonClick = () => {
		fileInputRef.current?.click() // Trigger click on hidden file input
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			onImportData(file)
		}
		// Reset file input to allow selecting the same file again
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<div className='container mx-auto space-y-6'>
			<div className='flex flex-col md:flex-row items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Product & Category Management</h1>
					<p className='text-muted-foreground'>Manage your product catalog and categories</p>
				</div>
				<div className='flex w-full md:w-max flex-col md:flex-row gap-2 items-center justify-between mt-6 md:mt-0'>
					<input type='file' ref={fileInputRef} onChange={handleFileChange} accept='.json' className='hidden' />
					<Button className='w-full md:w-max' onClick={handleImportButtonClick}>
						<Upload className='h-4 w-4 mr-2' /> Import
					</Button>
					<Button className='w-full md:w-max' onClick={onExportData}>
						<Download className='h-4 w-4 mr-2' /> Export
					</Button>
				</div>
			</div>

			<Tabs defaultValue='categories' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='categories' className='flex items-center gap-2'>
						<Tag className='h-4 w-4' />
						Categories
					</TabsTrigger>
					<TabsTrigger value='products' className='flex items-center gap-2'>
						<Package className='h-4 w-4' />
						Products
					</TabsTrigger>
				</TabsList>

				<TabsContent value='categories' className='space-y-4'>
					<CategoriesTable categories={categories} products={products} onAddCategory={handleAddCategory} />
				</TabsContent>

				<TabsContent value='products' className='space-y-4'>
					<ProductsTable categories={categories} products={products} onAddProduct={handleAddProduct} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
