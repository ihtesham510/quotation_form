import { v } from 'convex/values'

export const curtainsSchema = {
	id: v.string(),
	savedAt: v.string(),
	customer: v.object({
		name: v.string(),
		email: v.string(),
		phone: v.string(),
		address: v.string(),
		projectAddress: v.string(),
	}),
	quoteDate: v.string(),
	paymentTerms: v.string(),
	products: v.array(
		v.object({
			id: v.string(),
			name: v.string(),
			label: v.string(),
			categoryName: v.string(),
			priceType: v.union(v.literal('sqm'), v.literal('each')),
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
		}),
	),

	addOns: v.array(
		v.object({
			id: v.string(),
			name: v.string(),
			description: v.string(),
			unitType: v.union(
				v.literal('each'),
				v.literal('sqm'),
				v.literal('linear'),
			),
			unitPrice: v.number(),
			quantity: v.number(),
			width: v.optional(v.number()),
			height: v.optional(v.number()),
			length: v.optional(v.number()),
			total: v.number(),
			gstAmount: v.number(),
		}),
	),

	customServices: v.array(
		v.object({
			id: v.string(),
			name: v.string(),
			description: v.string(),
			price: v.number(),
			total: v.number(),
			gstAmount: v.number(),
		}),
	),

	pricing: v.object({
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
	}),
}

export const productSchema = {
	categoryId: v.id('categories'),
	name: v.string(),
	priceType: v.union(v.literal('sqm'), v.literal('each')),
	basePrice: v.number(),
	minimumQty: v.number(),
	leadTime: v.string(),
	specialConditions: v.optional(v.string()),
}

export const categorySchema = {
	userId: v.id('user'),
	name: v.string(),
	description: v.string(),
}
