import { v } from 'convex/values'

export const tile_material_schema = {
	name: v.string(),
	basePrice: v.number(),
	userId: v.id('user'),
	styleIds: v.array(v.id('tile_styles')),
	sizeIds: v.array(v.id('tile_sizes')),
	finishIds: v.array(v.id('tile_finishes')),
}

export const tile_styles_schema = {
	name: v.string(),
	userId: v.id('user'),
	multiplier: v.number(),
}

export const tile_sizes_schema = {
	name: v.string(),
	userId: v.id('user'),
	size: v.union(
		v.object({
			type: v.literal('linear_meter'),
			pricing: v.number(),
		}),
		v.object({
			type: v.literal('height_width'),
			height: v.number(),
			width: v.number(),
			price_type: v.union(v.literal('fixed_price'), v.literal('multiplier')),
			pricing: v.number(),
		}),
		v.object({
			type: v.literal('custom'),
			price_type: v.union(v.literal('fixed_price'), v.literal('multiplier')),
			pricing: v.number(),
		}),
	),
}

export const tile_finishes_schema = {
	name: v.string(),
	userId: v.id('user'),
	premium: v.number(),
}

const customerInfo = {
	name: v.string(),
	email: v.string(),
	phone: v.string(),
	customerAddress: v.string(),
	projectAddress: v.optional(v.string()),
}

const customItem = {
	id: v.string(),
	name: v.string(),
	price: v.number(),
	unit: v.string(),
	quantity: v.number(),
	measurement: v.optional(v.number()),
}

const customService = {
	id: v.string(),
	name: v.string(),
	price: v.number(),
}

const materialItem = {
	id: v.string(),
	label: v.string(),
	material: v.optional(v.object(tile_material_schema)),
	style: v.optional(v.object(tile_styles_schema)),
	size: v.optional(v.object(tile_sizes_schema)),
	finish: v.optional(v.object(tile_finishes_schema)),
	unit_value: v.number(),
}

const selections = {
	materialItems: v.array(v.object(materialItem)),
}

const addOns = {
	markup: v.optional(v.number()),
	customItems: v.array(v.object(customItem)),
	customServices: v.array(v.object(customService)),
}

const pricingOptions = {
	discount: v.object({
		enabled: v.boolean(),
		value: v.number(),
	}),
	gst: v.object({
		enabled: v.boolean(),
		percentage: v.number(),
	}),
}

const calculationResult = {
	materialCost: v.number(),
	markupAmount: v.number(),
	customItemsCost: v.number(),
	customServicesCost: v.number(),
	subtotal: v.number(),
	discountAmount: v.number(),
	afterDiscount: v.number(),
	gstAmount: v.number(),
	finalTotal: v.number(),
	breakdown: v.object({
		tileTotal: v.number(),
		tileGST: v.number(),
		customItemsGST: v.number(),
		customServicesGST: v.number(),
	}),
}

export const quotationData = {
	customerInfo: v.object(customerInfo),
	selections: v.object(selections),
	addOns: v.object(addOns),
	pricingOptions: v.object(pricingOptions),
	pricing: v.object(calculationResult),
}
