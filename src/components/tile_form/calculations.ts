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
 *
 * This function computes the total cost for one material item by combining:
 * - Base material cost (basePrice × unitValue × styleMultiplier)
 * - Size pricing (varies by size type and price type)
 * - Finish premium (finishPremium × unitValue)
 *
 * Size pricing calculation depends on the size type:
 * - linear_meter: Uses pricing as multiplier → unitValue × basePrice × styleMultiplier × sizePricing
 * - height_width/custom with multiplier: Same as linear_meter
 * - height_width/custom with fixed_price: Adds fixed amount per unit → baseCost + (sizePricing × unitValue)
 *
 * @param materialItem - Object containing material, style, size, finish selections and unit value
 * @returns Total cost for this single material item
 */
export function calculateSingleMaterialCost(materialItem: MaterialItem): number {
	const { material, style, size, finish, unit_value } = materialItem
	// validation
	if (!material || !style || !size || !finish || !unit_value) {
		console.log('Missing required selections for material item, returning 0')
		return 0
	}

	const basePrice = Number(material.basePrice) || 1
	const styleMultiplier = Number(style.multiplier) || 1
	const finishPremium = Number(finish.premium) || 0
	const unitValue = Number(unit_value) || 0

	// Handle the new size pricing structure
	let sizeCalculation = 0
	const sizePricing = Number(size.size.pricing) || 0

	switch (size.size.type) {
		case 'linear_meter':
			/*
			 * for linear meter first add the base and size pricing
			 * multiply with style multiplier then linear meter value
			 * */
			sizeCalculation = unitValue * styleMultiplier * (basePrice + sizePricing)
			break
		case 'height_width':
			if (size.size.price_type === 'fixed_price') {
				sizeCalculation = unitValue * styleMultiplier * (basePrice + sizePricing)
			} else {
				sizeCalculation = unitValue * styleMultiplier * basePrice * sizePricing
			}
			break
		case 'custom':
			if (size.size.price_type === 'fixed_price') {
				sizeCalculation = unitValue * (basePrice + sizePricing) * styleMultiplier * unitValue
			} else {
				/*
      * For Multiplyer pricing_type
      * Material: $25/sq ft base price
      * Style: 1.2 multiplier (Modern style)
      * Size: 1.15 multiplier (12x24 premium)
      * Finish: $2/sq ft premium
      * Unit Value: 100 sq ft

      * Calculation:
      * Base: 100 × $25 × 1.2 × 1.15 = $3,450
      * Finish: 100 × $2 = $200
      * Total: $3,650
      * */
				sizeCalculation = unitValue * styleMultiplier * sizePricing * basePrice
			}
			break
	}

	// Finish cost calculation remains the same
	const finishCost = finishPremium * unitValue

	console.log('log: Parsed numbers:', {
		basePrice,
		styleMultiplier,
		sizePricing,
		sizeType: size.size.type,
		priceType: size.size.type !== 'linear_meter' ? size.size.price_type : 'multiplier',
		finishPremium,
		sqFt: unitValue,
	})

	console.log('log: Calculated costs:', {
		sizeCalculation,
		finishCost,
		total: sizeCalculation + finishCost,
	})

	return sizeCalculation + finishCost
}

export function calculateSingleMaterialCostWithGstAndMarkup(item: MaterialItem, markup?: number, gst?: number) {
	const baseCost = calculateSingleMaterialCost(item)

	// Apply markup if enabled
	let costWithMarkup = baseCost
	if (markup && markup > 0) {
		costWithMarkup = baseCost * (1 + markup / 100)
	}
	// Apply GST if enabled
	let finalCost = costWithMarkup
	if (gst && gst > 0) {
		finalCost = costWithMarkup * (1 + gst / 100)
	}

	return finalCost
}

/**
 * Calculate base tile cost for all material items
 *
 * This function aggregates the costs of all selected material items by:
 * 1. Iterating through each material item in the selections
 * 2. Calculating individual cost using calculateSingleMaterialCost()
 * 3. Summing up all individual costs to get the total material cost
 *
 * This represents the total cost of all tiles before any markup, custom items, or services.
 *
 * @param selections - Object containing array of all selected material items
 * @returns Total cost of all material items combined
 */
export function calculateBaseTileCost(selections: Selections): number {
	console.log('log: calculateBaseTileCost inputs:', selections)

	if (!selections.materialItems || selections.materialItems.length === 0) {
		console.log('log: No material items found, returning 0')
		return 0
	}

	const totalCost = selections.materialItems.reduce((total, materialItem) => {
		const itemCost = calculateSingleMaterialCost(materialItem)
		console.log('log: Material item cost:', { itemCost })
		return total + itemCost
	}, 0)

	console.log('log: Total material cost:', totalCost)
	return totalCost
}

/**
 * Calculate markup amount (applies only to tile cost)
 *
 * This function calculates the profit margin added to the base tile cost by:
 * 1. Converting the markup percentage to a decimal (markup / 100)
 * 2. Multiplying the base tile cost by this decimal
 *
 * Formula: baseTileCost × (markup / 100)
 * Example: $1000 tiles with 20% markup = $1000 × 0.20 = $200 markup
 *
 * Note: Markup only applies to tile costs, not to custom items or services.
 *
 * @param baseTileCost - Total cost of all tile materials before markup
 * @param markup - Markup percentage (e.g., 20 for 20%)
 * @returns Dollar amount of markup to be added to tile cost
 */
export function calculateMarkupAmount(baseTileCost: number, markup?: number): number {
	console.log('log: calculateMarkupAmount inputs:', { baseTileCost, markup })

	if (!markup || markup <= 0) {
		console.log('log: No markup or invalid markup, returning 0')
		return 0
	}

	const markupValue = Number(markup) || 0
	const tileCost = Number(baseTileCost) || 0
	const result = tileCost * (markupValue / 100)

	console.log('log: Markup calculation:', { markupValue, tileCost, result })

	return result
}

/**
 * Calculate total cost for custom items
 *
 * This function computes the total cost of all custom items (non-tile materials) by:
 * 1. Iterating through each custom item in the array
 * 2. Multiplying item price by quantity for each item
 * 3. Summing all individual item totals
 *
 * Formula for each item: price × quantity
 * Example: 5 boxes of grout at $25 each = $25 × 5 = $125
 *
 * Custom items are additional materials/products that aren't tiles but are part of the project
 * (e.g., grout, adhesive, trim pieces, tools, etc.)
 *
 * @param customItems - Array of custom items with price and quantity
 * @returns Total cost of all custom items
 */
export function calculateCustomItemsTotal(customItems: CustomItem[]): number {
	console.log('log: calculateCustomItemsTotal inputs:', customItems)

	const total = customItems.reduce((total, item) => {
		const price = Number(item.price) || 0
		const quantity = Number(item.quantity) || 0
		const itemTotal = price * quantity
		console.log('log: Custom item:', {
			item: item.name,
			price,
			quantity,
			itemTotal,
		})
		return total + itemTotal
	}, 0)

	console.log('log: Custom items total:', total)
	return total
}

/**
 * Calculate total cost for custom services
 *
 * This function computes the total cost of all custom services by:
 * 1. Iterating through each custom service in the array
 * 2. Adding each service's price to the running total
 *
 * Custom services are additional labor or professional services that aren't included
 * in the base tile installation (e.g., demolition, waterproofing, design consultation,
 * delivery, cleanup, etc.)
 *
 * Unlike custom items, services typically don't have quantities - they're priced as
 * fixed amounts or already calculated totals.
 *
 * @param customServices - Array of custom services with their prices
 * @returns Total cost of all custom services
 */
export function calculateCustomServicesTotal(customServices: CustomService[]): number {
	console.log('log: calculateCustomServicesTotal inputs:', customServices)

	const total = customServices.reduce((total, service) => {
		const price = Number(service.price) || 0
		console.log('log: Custom service:', {
			service: service.name,
			price,
		})
		return total + price
	}, 0)

	console.log('log: Custom services total:', total)
	return total
}

/**
 * Calculate discount amount
 *
 * This function calculates the total discount amount to be subtracted from the grand total by:
 * 1. Checking if discount is enabled and has a positive value
 * 2. Converting discount percentage to decimal (value / 100)
 * 3. Multiplying the grand total by this decimal
 *
 * Formula: grandTotal × (discountValue / 100)
 * Example: $5000 total with 10% discount = $5000 × 0.10 = $500 discount
 *
 * Discount is applied to the entire subtotal (tiles + markup + custom items + services)
 * before GST/tax calculations.
 *
 * @param grandTotal - Total amount before discount (subtotal)
 * @param discount - Discount configuration with enabled flag and percentage value
 * @returns Dollar amount of discount to be subtracted
 */
export function calculateDiscountAmount(grandTotal: number, discount: { enabled: boolean; value: number }): number {
	if (!discount.enabled || discount.value <= 0) {
		return 0
	}

	return grandTotal * (discount.value / 100)
}

/**
 * Calculate GST for individual components
 *
 * This function calculates GST/tax breakdown for each component of the quotation:
 * 1. Converts GST percentage to decimal rate (percentage / 100)
 * 2. Calculates GST for tiles: tileTotal × gstRate
 * 3. Calculates GST for custom items: customItemsTotal × gstRate
 * 4. Calculates GST for custom services: customServicesTotal × gstRate
 * 5. Sums all GST amounts for total GST
 *
 * This breakdown is useful for:
 * - Detailed invoice reporting
 * - Tax compliance and accounting
 * - Understanding tax implications of different components
 *
 * Formula: componentTotal × (gstPercentage / 100)
 * Example: $1000 tiles with 10% GST = $1000 × 0.10 = $100 GST
 *
 * @param tileTotal - Total cost of tiles including markup
 * @param customItemsTotal - Total cost of all custom items
 * @param customServicesTotal - Total cost of all custom services
 * @param gst - GST configuration with enabled flag and percentage
 * @returns Object with GST breakdown for each component and total GST
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
 *
 * This is the master function that orchestrates the entire quotation calculation by:
 *
 * Step 1: Calculate base material cost (all tiles without markup)
 * Step 2: Apply markup percentage to tile cost only (profit margin)
 * Step 3: Calculate custom items and services totals
 * Step 4: Calculate subtotal (tiles + markup + custom items + services)
 * Step 5: Apply discount percentage to subtotal
 * Step 6: Calculate GST breakdown for each component
 * Step 7: Add total GST to get final amount
 *
 * Calculation Flow:
 * Material Cost → + Markup → + Custom Items → + Custom Services → = Subtotal
 * Subtotal → - Discount → = After Discount → + GST → = Final Total
 *
 * This function returns a comprehensive breakdown of all costs, making it easy to
 * generate detailed quotations and invoices.
 *
 * @param selections - All selected tile materials and specifications
 * @param addOns - Markup percentage, custom items, and custom services
 * @param pricingOptions - Discount and GST/tax settings
 * @returns Complete calculation result with all cost breakdowns
 */
export function calculateQuotationPricing(
	selections: Selections,
	addOns: AddOns,
	pricingOptions: PricingOptions,
): CalculationResult {
	console.log('log: calculateQuotationPricing called with:', {
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

	console.log('log: Final calculation result:', result)
	return result
}

/**
 * Format currency for display
 *
 * This utility function formats numeric values as currency strings by:
 * 1. Validating the input is a valid number (not NaN, null, undefined, or infinite)
 * 2. Using Intl.NumberFormat with US currency formatting
 * 3. Setting 2 decimal places for cents precision
 * 4. Returning "$0.00" for invalid inputs as a safe fallback
 *
 * Examples:
 * - 1234.56 → "$1,234.56"
 * - 1000 → "$1,000.00"
 * - NaN → "$0.00"
 *
 * Used throughout the application for consistent currency display in UI components,
 * quotations, and reports.
 *
 * @param amount - Numeric value to format as currency
 * @returns Formatted currency string with dollar sign and commas
 */
export function formatCurrency(amount: number): string {
	// Handle NaN, null, undefined, or invalid numbers
	if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
		console.log('log: Invalid amount for currency formatting:', amount)
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
 *
 * This utility function formats numeric percentage values for consistent display by:
 * 1. Converting the number to a fixed decimal with 1 decimal place
 * 2. Appending the "%" symbol
 *
 * Examples:
 * - 15 → "15.0%"
 * - 7.5 → "7.5%"
 * - 20.33333 → "20.3%"
 *
 * Used for displaying markup percentages, discount percentages, and GST rates
 * in the UI with consistent formatting.
 *
 * @param value - Numeric percentage value (e.g., 15 for 15%)
 * @returns Formatted percentage string with one decimal place and % symbol
 */
export function formatPercentage(value: number): string {
	return `${value.toFixed(1)}%`
}

/**
 * Validate that all required selections are made
 *
 * This validation function ensures the quotation has the minimum required data by:
 * 1. Checking that materialItems array exists
 * 2. Checking that materialItems array has at least one item
 *
 * This is a basic validation to prevent calculations on empty selections.
 * More detailed validation (checking that each material item has all required
 * fields like material, style, size, finish) is handled in the individual
 * calculation functions.
 *
 * Used before allowing users to proceed to next steps or generate quotations
 * to ensure they have selected at least one material item.
 *
 * @param selections - Object containing array of selected material items
 * @returns true if selections are valid (has at least one material item), false otherwise
 */
export function validateSelections(selections: Selections): boolean {
	return !!(selections.materialItems && selections.materialItems.length > 0)
}

/**
 * Generate a unique ID for custom items/services
 *
 * This utility function creates unique identifiers by combining:
 * 1. A prefix string (e.g., "item" or "service") for readability
 * 2. Current timestamp (Date.now()) for uniqueness across time
 * 3. Random string (9 characters from base36) for additional uniqueness
 *
 * Format: "prefix_timestamp_randomstring"
 * Example: "item_1703123456789_x7k2m8n4q"
 *
 * This ensures each custom item or service has a unique ID that can be used for:
 * - React key props
 * - Form field identification
 * - Database references
 * - Tracking changes and updates
 *
 * The combination of timestamp and random string makes collisions extremely unlikely.
 *
 * @param prefix - String prefix to make ID more readable (e.g., "item", "service")
 * @returns Unique string ID combining prefix, timestamp, and random characters
 */
export function generateUniqueId(prefix: string): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
