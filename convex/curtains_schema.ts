import { v } from 'convex/values'

export const customerSchema = v.object({
	name: v.string(),
	email: v.string(),
	phone: v.string(),
	address: v.string(),
	projectAddress: v.string(),
})

export const productItemSchema = v.object({
	id: v.string(),
	name: v.string(),
	label: v.string(),
	categoryName: v.string(),
	priceType: v.union(v.literal('sqm'), v.literal('each'), v.literal('matrix')),
	basePrice: v.number(),
	effectivePrice: v.number(),
	width: v.number(),
	height: v.number(),
	quantity: v.number(),
	color: v.string(),
	controlType: v.string(),
	installation: v.boolean(),
	specialFeatures: v.string(),
	total: v.number(),
	gstAmount: v.number(),
})

export const addOnSchema = v.object({
	id: v.string(),
	name: v.string(),
	description: v.string(),
	unitType: v.union(v.literal('each'), v.literal('sqm'), v.literal('linear')),
	unitPrice: v.number(),
	quantity: v.number(),
	width: v.optional(v.number()),
	height: v.optional(v.number()),
	length: v.optional(v.number()),
	total: v.number(),
	gstAmount: v.number(),
})

export const customServiceSchema = v.object({
	id: v.string(),
	name: v.string(),
	description: v.string(),
	price: v.number(),
	total: v.number(),
	gstAmount: v.number(),
})

export const pricingSchema = v.object({
	subtotalBeforeMarkupAndDiscount: v.number(),
	totalMarkup: v.number(),
	discountType: v.union(v.literal('percentage'), v.literal('fixed')),
	discountValue: v.number(),
	discountReason: v.string(),
	discountAmount: v.number(),
	gstEnabled: v.boolean(),
	gstRate: v.number(),
	totalGST: v.number(),
	grandTotal: v.number(),
})

export const curtainsSchema = {
	id: v.string(),
	savedAt: v.string(),
	customer: customerSchema,
	quoteDate: v.string(),
	paymentTerms: v.string(),

	products: v.array(productItemSchema),
	addOns: v.array(addOnSchema),
	customServices: v.array(customServiceSchema),

	pricing: pricingSchema,
}

export const productSchema = {
	categoryId: v.id('categories'),
	name: v.string(),
	height: v.optional(v.number()),
	width: v.optional(v.number()),
	priceType: v.union(v.literal('sqm'), v.literal('each'), v.literal('matrix')),
	basePrice: v.number(),
	minimumQty: v.number(),
	leadTime: v.string(),
	specialConditions: v.optional(v.string()),
	priceMatrix: v.optional(
		v.array(
			v.object({
				height: v.number(),
				width: v.number(),
				price: v.number(),
			}),
		),
	),
}

export const categorySchema = {
	userId: v.id('user'),
	name: v.string(),
	description: v.string(),
}
