import type {
	CustomItem,
	CustomService,
	Selections,
	AddOns,
	PricingOptions,
	CalculationResult,
	MaterialItem,
} from './types'

/**
 * Calculate base tile cost for a single material item
 */
export function calculateSingleMaterialCost(materialItem: MaterialItem): number {
	const { material, style, size, finish, squareFootage } = materialItem

	console.log('[v0] calculateSingleMaterialCost inputs:', {
		material,
		style,
		size,
		finish,
		squareFootage,
	})

	if (!material || !style || !size || !finish || !squareFootage) {
		console.log('[v0] Missing required selections for material item, returning 0')
		return 0
	}

	// Ensure all values are numbers
	const basePrice = Number(material.basePrice) || 0
	const styleMultiplier = Number(style.multiplier) || 1
	const sizeMultiplier = Number(size.multiplier) || 1
	const finishPremium = Number(finish.premium) || 0
	const sqFt = Number(squareFootage) || 0

	console.log('[v0] Parsed numbers:', {
		basePrice,
		styleMultiplier,
		sizeMultiplier,
		finishPremium,
		sqFt,
	})

	// Base calculation: squareFootage × basePrice × style.multiplier × size.multiplier + (finish.premium × squareFootage)
	const baseCost = sqFt * basePrice * styleMultiplier * sizeMultiplier
	const finishCost = finishPremium * sqFt

	console.log('[v0] Calculated costs:', {
		baseCost,
		finishCost,
		total: baseCost + finishCost,
	})

	return baseCost + finishCost
}

/**
 * Calculate base tile cost for all material items
 */
export function calculateBaseTileCost(selections: Selections): number {
	console.log('[v0] calculateBaseTileCost inputs:', selections)

	if (!selections.materialItems || selections.materialItems.length === 0) {
		console.log('[v0] No material items found, returning 0')
		return 0
	}

	const totalCost = selections.materialItems.reduce((total, materialItem) => {
		const itemCost = calculateSingleMaterialCost(materialItem)
		console.log('[v0] Material item cost:', { itemCost })
		return total + itemCost
	}, 0)

	console.log('[v0] Total material cost:', totalCost)
	return totalCost
}

/**
 * Calculate markup amount (applies only to tile cost)
 */
export function calculateMarkupAmount(baseTileCost: number, markup?: number): number {
	console.log('[v0] calculateMarkupAmount inputs:', { baseTileCost, markup })

	if (!markup || markup <= 0) {
		console.log('[v0] No markup or invalid markup, returning 0')
		return 0
	}

	const markupValue = Number(markup) || 0
	const tileCost = Number(baseTileCost) || 0
	const result = tileCost * (markupValue / 100)

	console.log('[v0] Markup calculation:', { markupValue, tileCost, result })

	return result
}

/**
 * Calculate total cost for custom items
 */
export function calculateCustomItemsTotal(customItems: CustomItem[]): number {
	console.log('[v0] calculateCustomItemsTotal inputs:', customItems)

	const total = customItems.reduce((total, item) => {
		const price = Number(item.price) || 0
		const quantity = Number(item.quantity) || 0
		const itemTotal = price * quantity
		console.log('[v0] Custom item:', {
			item: item.name,
			price,
			quantity,
			itemTotal,
		})
		return total + itemTotal
	}, 0)

	console.log('[v0] Custom items total:', total)
	return total
}

/**
 * Calculate total cost for custom services
 */
export function calculateCustomServicesTotal(customServices: CustomService[]): number {
	console.log('[v0] calculateCustomServicesTotal inputs:', customServices)

	const total = customServices.reduce((total, service) => {
		const price = Number(service.price) || 0
		console.log('[v0] Custom service:', {
			service: service.name,
			price,
		})
		return total
	}, 0)

	console.log('[v0] Custom services total:', total)
	return total
}

/**
 * Calculate discount amount
 */
export function calculateDiscountAmount(grandTotal: number, discount: { enabled: boolean; value: number }): number {
	if (!discount.enabled || discount.value <= 0) {
		return 0
	}

	return grandTotal * (discount.value / 100)
}

/**
 * Calculate GST for individual components
 */
export function calculateGSTBreakdown(
	tileTotal: number,
	customItemsTotal: number,
	customServicesTotal: number,
	gst: { enabled: boolean; percentage: number },
) {
	if (!gst.enabled || gst.percentage <= 0) {
		return {
			tileGST: 0,
			customItemsGST: 0,
			customServicesGST: 0,
			totalGST: 0,
		}
	}

	const gstRate = gst.percentage / 100
	const tileGST = tileTotal * gstRate
	const customItemsGST = customItemsTotal * gstRate
	const customServicesGST = customServicesTotal * gstRate

	return {
		tileGST,
		customItemsGST,
		customServicesGST,
		totalGST: tileGST + customItemsGST + customServicesGST,
	}
}

/**
 * Main calculation function that computes all pricing
 */
export function calculateQuotationPricing(
	selections: Selections,
	addOns: AddOns,
	pricingOptions: PricingOptions,
): CalculationResult {
	console.log('[v0] calculateQuotationPricing called with:', {
		selections,
		addOns,
		pricingOptions,
	})

	// Step 1: Calculate base tile cost
	const materialCost = calculateBaseTileCost(selections)

	// Step 2: Apply markup to tile cost only
	const markupAmount = calculateMarkupAmount(materialCost, addOns.markup)
	const tileTotal = materialCost + markupAmount

	// Step 3: Calculate custom items and services totals
	const customItemsCost = calculateCustomItemsTotal(addOns.customItems)
	const customServicesCost = calculateCustomServicesTotal(addOns.customServices)

	// Step 4: Calculate subtotal (grand total before discount)
	const subtotal = tileTotal + customItemsCost + customServicesCost

	// Step 5: Apply discount to grand total
	const discountAmount = calculateDiscountAmount(subtotal, pricingOptions.discount)
	const afterDiscount = subtotal - discountAmount

	// Step 6: Calculate GST breakdown
	const gstBreakdown = calculateGSTBreakdown(tileTotal, customItemsCost, customServicesCost, pricingOptions.gst)

	// Step 7: Final total
	const finalTotal = afterDiscount + gstBreakdown.totalGST

	const result = {
		materialCost,
		markupAmount,
		customItemsCost,
		customServicesCost,
		subtotal,
		discountAmount,
		afterDiscount,
		gstAmount: gstBreakdown.totalGST,
		finalTotal,
		breakdown: {
			tileTotal,
			tileGST: gstBreakdown.tileGST,
			customItemsGST: gstBreakdown.customItemsGST,
			customServicesGST: gstBreakdown.customServicesGST,
		},
	}

	console.log('[v0] Final calculation result:', result)
	return result
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
	// Handle NaN, null, undefined, or invalid numbers
	if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
		console.log('[v0] Invalid amount for currency formatting:', amount)
		return '$0.00'
	}

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
	return `${value.toFixed(1)}%`
}

/**
 * Validate that all required selections are made
 */
export function validateSelections(selections: Selections): boolean {
	return !!(selections.materialItems && selections.materialItems.length > 0)
}

/**
 * Generate a unique ID for custom items/services
 */
export function generateUniqueId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
