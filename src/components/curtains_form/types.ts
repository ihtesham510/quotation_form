import type { DataModel, Id } from 'convex/_generated/dataModel'
export type { Id }

export interface Customer {
	name: string
	email: string
	phone: string
	address: string
	projectAddress: string
}

export interface QuoteProduct {
	id: string
	label: string
	productId: Id<'products'>
	width: number
	height: number
	quantity: number
	customPrice?: number
	color: string
	controlType: string
	installation: boolean
	specialFeatures: string
}

export interface AddOn {
	id: string
	name: string
	description: string
	unitType: 'each' | 'sqm' | 'linear'
	unitPrice: number
	quantity: number
	width?: number
	height?: number
	length?: number
}

export interface CustomService {
	id: string
	name: string
	description: string
	price: number
}

export interface QuoteData {
	customer: Customer
	products: QuoteProduct[]
	addOns: AddOn[]
	customServices: CustomService[]
	discountType: 'percentage' | 'fixed'
	discountValue: number
	discountReason: string
	taxRate: number
	paymentTerms: string
	quoteDate: string
	gstEnabled: boolean
	gstRate: number
	markupEnabled: boolean
	markupType: 'percentage' | 'fixed'
	markupValue: number
}

export type QuoteFormData = QuoteData

export type Category = DataModel['categories']['document']
export type Product = DataModel['products']['document']

export interface ProductDatabase {
	categories: Category[]
	products: Product[]
}

export interface QuoteCalculatedData {
	quoteData: QuoteData
	calculations: {
		subtotal: number
		discount: number
		tax: number
		gst: number
		markup: number
		total: number
		productTotals: { productId: string; total: number }[]
	}
	metadata: {
		generatedAt: string
		itemCount: number
	}
}

export interface SelfContainedQuoteData {
	id: string
	savedAt: string
	customer: Customer
	quoteDate: string
	paymentTerms: string

	products: Array<{
		id: string
		name: string
		label: string
		categoryName: string
		priceType: 'sqm' | 'each' | 'matrix'
		basePrice: number
		effectivePrice: number
		width: number
		height: number
		quantity: number
		color: string
		controlType: string
		installation: boolean
		specialFeatures: string
		total: number
		gstAmount: number
	}>

	addOns: Array<{
		id: string
		name: string
		description: string
		unitType: 'each' | 'sqm' | 'linear'
		unitPrice: number
		quantity: number
		width?: number
		height?: number
		length?: number
		total: number
		gstAmount: number
	}>

	customServices: Array<{
		id: string
		name: string
		description: string
		price: number
		total: number
		gstAmount: number
	}>

	pricing: {
		subtotalBeforeMarkupAndDiscount: number
		totalMarkup: number
		discountType: 'percentage' | 'fixed'
		discountValue: number
		discountReason: string
		discountAmount: number
		gstEnabled: boolean
		gstRate: number
		totalGST: number
		grandTotal: number
	}
}
