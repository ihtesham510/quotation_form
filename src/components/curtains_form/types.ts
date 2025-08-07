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
	// Renamed from RoomProduct
	id: string
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
	unitType: 'each' | 'sqm' | 'linear' // Updated unit types
	unitPrice: number
	quantity: number
	width?: number // New: Optional width for sqm
	height?: number // New: Optional height for sqm
	length?: number // New: Optional length for linear
}

// New interface for custom services
export interface CustomService {
	id: string
	name: string
	description: string
	price: number
}

export interface QuoteData {
	customer: Customer
	products: QuoteProduct[] // Changed from rooms: Room[]
	addOns: AddOn[]
	customServices: CustomService[] // New: Array for custom services
	// Removed deliveryOption, installationService, siteMeasurement
	discountType: 'percentage' | 'fixed'
	discountValue: number
	discountReason: string
	taxRate: number // This is now effectively unused for calculations, kept for type compatibility
	paymentTerms: string
	quoteDate: string
	gstEnabled: boolean
	gstRate: number
	markupEnabled: boolean // New: Enable/disable markup
	markupType: 'percentage' | 'fixed' // New: Markup type
	markupValue: number // New: Markup value
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
		markup: number // New: Total markup amount
		total: number
		productTotals: { productId: string; total: number }[] // Adjusted for flat products
	}
	metadata: {
		generatedAt: string
		itemCount: number
	}
}

// New self-contained data structure for saved quotes
export interface SelfContainedQuoteData {
	id: string
	savedAt: string
	customer: Customer
	quoteDate: string
	paymentTerms: string

	// Products with all necessary details
	products: Array<{
		id: string
		name: string
		categoryName: string
		priceType: 'sqm' | 'each'
		basePrice: number
		effectivePrice: number // Price after markup
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

	// Add-ons with all details
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

	// Custom services with all details
	customServices: Array<{
		id: string
		name: string
		description: string
		price: number
		total: number
		gstAmount: number
	}>

	// Pricing details
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
