import { z } from 'zod'
import type { Category, Product } from './types'

const categorySchema = z.object({
	_id: z.string(), // Expect string IDs from imported data
	name: z.string(),
	description: z.string(),
})

const productSchema = z.object({
	_id: z.string(), // Expect string IDs from imported data
	categoryId: z.string(), // Expect string IDs from imported data
	name: z.string(),
	priceType: z.enum(['sqm', 'each']),
	basePrice: z.number(),
	minimumQty: z.number(),
	leadTime: z.string(),
	specialConditions: z.string().optional(),
})

// Define a schema for the imported data structure
const importedDataSchema = z.object({
	categories: z.array(categorySchema),
	products: z.array(productSchema),
})

export type ImportedData = z.infer<typeof importedDataSchema>

/**
 * Validates the schema of imported data (categories and products).
 * Returns an error message if validation fails, otherwise null.
 */
export function validateImportDataSchema(data: any): string | null {
	try {
		const parsedData = importedDataSchema.parse(data)

		// Further validate each category and product against their specific schemas
		for (const cat of parsedData.categories) {
			categorySchema.parse(cat) // Use categorySchema for individual validation
		}
		for (const prod of parsedData.products) {
			productSchema.parse(prod) // Use productSchema for individual validation
		}

		return null // No schema errors
	} catch (error) {
		if (error instanceof z.ZodError) {
			return `Schema validation failed: ${error.errors.map(e => e.message).join('; ')}`
		}
		return `Invalid data format: ${error instanceof Error ? error.message : String(error)}`
	}
}

/**
 * Validates the referential integrity of imported data (product categoryIds against category _ids).
 * Returns an error message if validation fails, otherwise null.
 */
export function validateImportDataRelations(importedData: ImportedData): string | null {
	const categoryIds = new Set(importedData.categories.map(cat => cat._id))

	for (const product of importedData.products) {
		if (!categoryIds.has(product.categoryId)) {
			return `Product "${product.name}" (ID: ${product._id}) references a non-existent category ID: "${product.categoryId}".`
		}
	}
	return null // No relation errors
}

/**
 * Exports current categories and products to a JSON file.
 */
export function exportData(categories: Category[], products: Product[]) {
	const dataToExport = {
		categories: categories.map(({ _creationTime, ...rest }) => rest), // Exclude _creationTime for cleaner export
		products: products.map(({ _creationTime, ...rest }) => rest), // Exclude _creationTime for cleaner export
	}
	const jsonString = JSON.stringify(dataToExport, null, 2)
	const blob = new Blob([jsonString], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `product-category-data-${new Date().toISOString().split('T')[0]}.json`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}
