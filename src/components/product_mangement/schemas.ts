import { z } from 'zod'

export const categorySchema = z.object({
	title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
	description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
})

export const productSchema = z
	.object({
		categoryId: z.string().min(1, 'Category is required'),
		name: z.string().min(1, 'Product name is required').max(200, 'Name must be less than 200 characters'),
		priceType: z.enum(['sqm', 'each', 'matrix'], {
			required_error: 'Price type is required',
		}),
		basePrice: z.number(),
		minimumQty: z.number().int().min(1, 'Minimum quantity must be at least 1'),
		leadTime: z.string().min(1, 'Lead time is required').max(100, 'Lead time must be less than 100 characters'),
		specialConditions: z.string().max(1000, 'Special conditions must be less than 1000 characters').optional(),
		priceMatrix: z.optional(
			z.array(
				z.object({
					height: z.number(),
					width: z.number(),
					price: z.number(),
				}),
			),
		),
	})
	.superRefine((data, ctx) => {
		if (data.priceType !== 'matrix') {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Base Price must be under greater than 0',
				path: ['basePrice'],
			})
		}
	})

export type CategoryFormValues = z.infer<typeof categorySchema>
export type ProductFormValues = z.infer<typeof productSchema>
