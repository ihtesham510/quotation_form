import type { DataModel } from 'convex/_generated/dataModel'

export interface CustomerInfo {
	name: string
	email: string
	phone: string
	customerAddress: string
	projectAddress?: string
}

export type Material = DataModel['tile_material']['document']
export type Style = DataModel['tile_styles']['document']
export type Size = DataModel['tile_sizes']['document']
export type Finish = DataModel['tile_finishes']['document']

export interface TileData {
	materials: Material[]
	styles: Style[]
	sizes: Size[]
	finishes: Finish[]
}

export interface CustomItem {
	id: string
	name: string
	price: number
	unit: string
	quantity: number
	measurement?: number
}

export interface CustomService {
	id: string
	name: string
	price: number
}

// Form Data Types
export interface MaterialItem {
	id: string
	label: string // Added label field for custom item titles
	material?: Material
	style?: Style
	size?: Size
	finish?: Finish
	unit_value: number
}

export interface Selections {
	materialItems: MaterialItem[]
}

export interface AddOns {
	markup?: number
	customItems: CustomItem[]
	customServices: CustomService[]
}

export interface PricingOptions {
	discount: {
		enabled: boolean
		value: number
	}
	gst: {
		enabled: boolean
		percentage: number
	}
}

export interface FormData {
	customerInfo: CustomerInfo
	selections: Selections
	addOns: AddOns
	pricingOptions: PricingOptions
}

// Calculation Result Types
export interface CalculationResult {
	materialCost: number
	markupAmount: number
	customItemsCost: number
	customServicesCost: number
	subtotal: number
	discountAmount: number
	afterDiscount: number
	gstAmount: number
	finalTotal: number
	breakdown: {
		tileTotal: number
		tileGST: number
		customItemsGST: number
		customServicesGST: number
	}
}

// Comprehensive Quotation Data Interface for Database Storage
export interface QuotationData {
	customerInfo: CustomerInfo
	selections: Selections
	addOns: AddOns
	pricingOptions: PricingOptions
	pricing: CalculationResult
}

// Component Props Types
export interface TileQuotationIndexProps {
	tileData: TileData
	onSave?: (data: QuotationData) => void
	onEmail?: (data: QuotationData) => void
	onGeneratePDF?: (data: QuotationData) => void
}

// Step Component Props Types
export interface Step1Props {
	customerInfo: CustomerInfo
	onCustomerInfoChange: (customerInfo: CustomerInfo) => void
	onNext: () => void
	isValid: boolean
	errors: Record<string, string>
}

export interface Step2Props {
	materials: Material[]
	styles: Style[]
	sizes: Size[]
	finishes: Finish[]
	selections: Selections
	onSelectionsChange: (selections: Selections) => void
	onNext: () => void
	onPrevious: () => void
	pricing: CalculationResult
	isValid: boolean
	errors: Record<string, string>
}

export interface Step3Props {
	addOns: AddOns
	onAddOnsChange: (addOns: AddOns) => void
	onNext: () => void
	onPrevious: () => void
	pricing: CalculationResult
}

export interface Step4Props {
	pricingOptions: PricingOptions
	onPricingOptionsChange: (pricingOptions: PricingOptions) => void
	onNext: () => void
	onPrevious: () => void
	pricing: CalculationResult
}

export interface Step5Props {
	customerInfo: CustomerInfo
	selections: Selections
	addOns: AddOns
	pricingOptions: PricingOptions
	pricing: CalculationResult
	onPrevious: () => void
	onSave: () => void
	onEmail: () => void
	onGeneratePDF: () => void
	onStepJump: (step: number) => void
}

export interface StepNavigationProps {
	currentStep: number
	totalSteps: number
	stepLabels: string[]
	onStepChange: (step: number) => void
	canNavigateToStep: (step: number) => boolean
}

export interface PricingSummaryProps {
	pricing: CalculationResult
	showDetailed?: boolean
}

export const unitOptions = ['square foot', 'square meter', 'linear meter', 'linear feet', 'each']
