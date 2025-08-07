import { LoaderComponent } from '@/components/loader-component'
import { ProductCategoryManager } from '@/components/product_mangement'
import {
	exportData,
	validateImportDataRelations,
	validateImportDataSchema,
	type ImportedData,
} from '@/components/product_mangement/utils'
import { useAuth } from '@/context/auth'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { Suspense } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/products/')({
	component: () => (
		<Suspense fallback={<LoaderComponent />}>
			<RouteComponent />
		</Suspense>
	),
})

function RouteComponent() {
	const { user } = useAuth()
	const data = useQuery(api.product_categoreis.getProductAndCategories, {
		userId: user ? user._id : undefined,
	})
	const addCategoryMutation = useMutation(api.product_categoreis.addCategory)
	const addProductMutation = useMutation(api.product_categoreis.addProduct)
	const handleImportData = (file: File) => {
		const reader = new FileReader()
		reader.onload = async e => {
			try {
				const content = e.target?.result as string
				const importedData: ImportedData = JSON.parse(content)

				// 1. Validate Schema
				const schemaError = validateImportDataSchema(importedData)
				if (schemaError) {
					console.info('schema validation error', schemaError)
					toast.error(`Import failed: ${schemaError}`)
					return
				}

				// 2. Validate Relations
				const relationError = validateImportDataRelations(importedData)
				if (relationError) {
					console.info('relation validation error', relationError)
					toast.error(`Import failed: ${relationError}`)
					return
				}

				// Add categories first and build the ID map
				toast.promise(
					async () =>
						await Promise.all(
							importedData.categories.map(async cat => {
								const importedProducts = importedData.products.filter(
									prod => prod.categoryId === cat._id,
								)
								if (user) {
									const catId = await addCategoryMutation({
										userId: user._id,
										name: cat.name,
										description: cat.description,
									})
									await Promise.all(
										importedProducts.map(
											async prod =>
												await addProductMutation({
													name: prod.name,
													basePrice: prod.basePrice,
													leadTime: prod.leadTime,
													minimumQty: prod.minimumQty,
													priceType: prod.priceType,
													specialConditions: prod.specialConditions,
													categoryId: catId,
												}),
										),
									)
								}
							}),
						),
					{
						success: () =>
							`Successfully imported ${importedData.categories.length} categories and ${importedData.products.length} products!`,
						error: error => {
							console.log(error)
							return `Failed to parse JSON file: ${error instanceof Error ? error.message : String(error)}`
						},
					},
				)
			} catch (error) {
				console.log(error)
			}
		}
		reader.readAsText(file)
	}

	const handleExportData = () => {
		if (data) {
			exportData(data.categories, data.products)
			toast.success('Data exported successfully!')
		}
	}
	return (
		<div>
			{data && (
				<ProductCategoryManager
					onImportData={handleImportData}
					onExportData={handleExportData}
					categories={data.categories}
					products={data.products}
				/>
			)}
		</div>
	)
}
