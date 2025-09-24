import type { QuoteProduct, AddOn, CustomService, ProductDatabase, QuoteData, Product } from './types'

/**
 * Finds the exact matching price from the price matrix based on product dimensions.
 * Returns the price from the matrix entry that exactly matches the product's width and height.
 * Returns 0 if no exact match is found, as matrix pricing requires exact dimensional matches.
 */
const findMatrixPrice = (product: QuoteProduct, productInfo: Product): number => {
	if (!productInfo.priceMatrix || productInfo.priceMatrix.length === 0) {
		return 0 // No pricing available without matrix
	}

	const exactMatch = productInfo.priceMatrix.find(
		(matrix: any) => matrix.width === product.width && matrix.height === product.height,
	)

	// Matrix pricing requires exact matches - no fallbacks
	return exactMatch ? exactMatch.price : 0
}

/**
 * Checks if a product has valid pricing available based on its type and dimensions.
 * For matrix products, validates that exact dimensions exist in the price matrix.
 */
export const isProductPricingValid = (product: QuoteProduct, productDatabase: ProductDatabase): boolean => {
	const productInfo = productDatabase.products.find(p => p._id === product.productId)
	if (!productInfo) return false

	if (productInfo.priceType === 'matrix') {
		// Matrix pricing requires exact dimensional match
		if (!productInfo.priceMatrix || productInfo.priceMatrix.length === 0) {
			return false
		}

		const exactMatch = productInfo.priceMatrix.find(
			(matrix: any) => matrix.width === product.width && matrix.height === product.height,
		)
		return !!exactMatch
	}

	// Non-matrix products are valid if they have a base price
	return (productInfo.basePrice || 0) > 0
}

/**
 * Gets available dimensions for a matrix product.
 * Returns empty array for non-matrix products.
 */
export const getAvailableMatrixDimensions = (
	productInfo: Product,
): Array<{ width: number; height: number; price: number }> => {
	if (productInfo.priceType !== 'matrix' || !productInfo.priceMatrix) {
		return []
	}
	return productInfo.priceMatrix.map(matrix => ({
		width: matrix.width,
		height: matrix.height,
		price: matrix.price,
	}))
}

/**
 * Calculates the original base price of a product before any markup or GST.
 * If a custom price is set on the product, it is used; otherwise, the product's base price from the database is used.
 * For matrix pricing, it finds the exact price from the price matrix.
 * Returns 0 if the product is not found or if matrix dimensions are invalid.
 */
export const calculateProductOriginalBasePrice = (product: QuoteProduct, productDatabase: ProductDatabase): number => {
	const productInfo = productDatabase.products.find(p => p._id === product.productId)
	if (!productInfo) return 0

	if (product.customPrice && product.customPrice > 0) {
		return product.customPrice
	}

	if (productInfo.priceType === 'matrix') {
		return findMatrixPrice(product, productInfo)
	}

	return productInfo.basePrice || 0
}

/**
 * Calculates the total base price of a product before markup or GST.
 * For invalid matrix dimensions, returns 0 to prevent incorrect calculations.
 * If the product is priced by area (sqm), it uses the greater of the actual area or the minimum quantity.
 * If the product uses matrix pricing, it uses the matrix price directly with quantity.
 */
export const calculateProductBaseTotal = (product: QuoteProduct, productDatabase: ProductDatabase): number => {
	const productInfo = productDatabase.products.find(p => p._id === product.productId)
	if (!productInfo) return 0

	// Check if product pricing is valid (especially important for matrix products)
	if (!isProductPricingValid(product, productDatabase)) {
		return 0
	}

	const originalPrice = calculateProductOriginalBasePrice(product, productDatabase)
	if (originalPrice <= 0) return 0

	let baseTotal = 0
	if (productInfo.priceType === 'sqm') {
		const sqm = product.width * product.height
		const minSqm = productInfo.minimumQty || 0
		const billableSqm = Math.max(sqm, minSqm)
		baseTotal = billableSqm * originalPrice * product.quantity
	} else if (productInfo.priceType === 'matrix') {
		// Matrix pricing uses the exact price from the matrix
		baseTotal = originalPrice * product.quantity
	} else {
		// Per-each pricing
		const minQty = productInfo.minimumQty || 0
		const billableQty = Math.max(product.quantity, minQty)
		baseTotal = originalPrice * billableQty
	}
	return baseTotal
}

/**
 * Calculates the total base price for an add-on before GST.
 * Supports different unit types: sqm, linear, or each.
 */
export const calculateAddOnBaseTotal = (addOn: AddOn): number => {
	let baseTotal = 0
	if (addOn.unitType === 'sqm') {
		baseTotal = addOn.unitPrice * addOn.quantity * (addOn.width || 0) * (addOn.height || 0)
	} else if (addOn.unitType === 'linear') {
		baseTotal = addOn.unitPrice * addOn.quantity * (addOn.length || 0)
	} else {
		baseTotal = addOn.unitPrice * addOn.quantity
	}
	return baseTotal
}

/**
 * Returns the base price for a custom service (already fixed).
 * No quantity or unit calculation is performed.
 */
export const calculateCustomServiceBaseTotal = (service: CustomService): number => {
	return service.price
}

/**
 * Calculates the subtotal of all items before applying any markup, GST, or discounts.
 * Includes products, add-ons, and custom services.
 * Only includes products with valid pricing.
 */
export const calculateSubtotalBeforeAll = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	const productsTotal = quoteData.products.reduce((total, product) => {
		// Only include products with valid pricing
		if (isProductPricingValid(product, productDatabase)) {
			return total + calculateProductBaseTotal(product, productDatabase)
		}
		return total
	}, 0)

	const addOnsTotal = quoteData.addOns.reduce((total, addOn) => total + calculateAddOnBaseTotal(addOn), 0)
	const customServicesTotal = quoteData.customServices.reduce(
		(total, service) => total + calculateCustomServiceBaseTotal(service),
		0,
	)

	return productsTotal + addOnsTotal + customServicesTotal
}

/**
 * Calculates the effective price of a product after applying markup.
 * Supports percentage or fixed value markup.
 * Returns 0 for products with invalid pricing.
 */
export const calculateProductEffectiveBasePrice = (
	product: QuoteProduct,
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	if (!isProductPricingValid(product, productDatabase)) {
		return 0
	}

	const originalPrice = calculateProductOriginalBasePrice(product, productDatabase)
	let effectivePrice = originalPrice

	if (quoteData.markupEnabled && originalPrice > 0) {
		if (quoteData.markupType === 'percentage') {
			effectivePrice = originalPrice * (1 + quoteData.markupValue / 100)
		} else {
			effectivePrice = originalPrice + quoteData.markupValue
		}
	}
	return effectivePrice
}

/**
 * Calculates the total cost of a product after applying markup but before GST.
 * Handles area-based, matrix-based, and quantity-based pricing.
 * Returns 0 for products with invalid pricing.
 */
export const calculateProductTotalAfterMarkup = (
	product: QuoteProduct,
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const productInfo = productDatabase.products.find(p => p._id === product.productId)
	if (!productInfo || !isProductPricingValid(product, productDatabase)) return 0

	const effectivePrice = calculateProductEffectiveBasePrice(product, quoteData, productDatabase)
	if (effectivePrice <= 0) return 0

	let total = 0
	if (productInfo.priceType === 'sqm') {
		const sqm = product.width * product.height
		const minSqm = productInfo.minimumQty || 0
		const billableSqm = Math.max(sqm, minSqm)
		total = billableSqm * effectivePrice * product.quantity
	} else if (productInfo.priceType === 'matrix') {
		total = effectivePrice * product.quantity
	} else {
		const minQty = productInfo.minimumQty || 0
		const billableQty = Math.max(product.quantity, minQty)
		total = effectivePrice * billableQty
	}
	return total
}

/**
 * Calculates the final total price for a product after applying markup and GST.
 * Returns 0 for products with invalid pricing.
 */
export const calculateProductTotal = (
	product: QuoteProduct,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
	quoteData: QuoteData,
): number => {
	if (!isProductPricingValid(product, productDatabase)) {
		return 0
	}

	let total = calculateProductTotalAfterMarkup(product, quoteData, productDatabase)
	if (gstEnabled && total > 0) {
		total = total * (1 + gstRate / 100)
	}
	return total
}

/**
 * Calculates the GST amount for a product based on its total price after markup.
 * Returns 0 for products with invalid pricing.
 */
export const calculateProductGST = (
	product: QuoteProduct,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
	quoteData: QuoteData,
): number => {
	if (!gstEnabled || !isProductPricingValid(product, productDatabase)) return 0
	const baseValue = calculateProductTotalAfterMarkup(product, quoteData, productDatabase)
	return baseValue * (gstRate / 100)
}

/**
 * Calculates the total price for an add-on including GST if applicable.
 */
export const calculateAddOnTotal = (addOn: AddOn, gstEnabled = false, gstRate = 0): number => {
	let total = calculateAddOnBaseTotal(addOn)
	if (gstEnabled) {
		total = total * (1 + gstRate / 100)
	}
	return total
}

/**
 * Calculates the GST portion for an add-on.
 */
export const calculateAddOnGST = (addOn: AddOn, gstEnabled = false, gstRate = 0): number => {
	if (!gstEnabled) return 0
	const baseValue = calculateAddOnBaseTotal(addOn)
	return baseValue * (gstRate / 100)
}

/**
 * Calculates the total price for a custom service including GST if applicable.
 */
export const calculateCustomServiceTotal = (service: CustomService, gstEnabled = false, gstRate = 0): number => {
	let total = calculateCustomServiceBaseTotal(service)
	if (gstEnabled) {
		total = total * (1 + gstRate / 100)
	}
	return total
}

/**
 * Calculates the GST amount for a custom service.
 */
export const calculateCustomServiceGST = (service: CustomService, gstEnabled = false, gstRate = 0): number => {
	if (!gstEnabled) return 0
	const baseValue = calculateCustomServiceBaseTotal(service)
	return baseValue * (gstRate / 100)
}

/**
 * Calculates the total markup added to all products in the quote.
 * This is the total extra amount charged due to markup (either percentage or fixed).
 * Only includes products with valid pricing.
 */
export const calculateTotalMarkup = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	if (!quoteData.markupEnabled) return 0

	let totalMarkup = 0
	quoteData.products.forEach(product => {
		if (!isProductPricingValid(product, productDatabase)) {
			return // Skip products with invalid pricing
		}

		const originalBasePrice = calculateProductOriginalBasePrice(product, productDatabase)
		const effectivePrice = calculateProductEffectiveBasePrice(product, quoteData, productDatabase)

		const priceDifferencePerUnit = effectivePrice - originalBasePrice

		const productInfo = productDatabase.products.find(p => p._id === product.productId)
		if (!productInfo) return

		if (productInfo.priceType === 'sqm') {
			const sqm = product.width * product.height
			const minSqm = productInfo.minimumQty || 0
			const billableSqm = Math.max(sqm, minSqm)
			totalMarkup += priceDifferencePerUnit * billableSqm * product.quantity
		} else if (productInfo.priceType === 'matrix') {
			totalMarkup += priceDifferencePerUnit * product.quantity
		} else {
			const minQty = productInfo.minimumQty || 0
			const billableQty = Math.max(product.quantity, minQty)
			totalMarkup += priceDifferencePerUnit * billableQty
		}
	})
	return totalMarkup
}

/**
 * Calculates the subtotal of all items after applying markup but before GST and discount.
 * Only includes products with valid pricing.
 */
export const calculateSubtotalAfterMarkup = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	const productsTotal = quoteData.products.reduce((total, product) => {
		if (isProductPricingValid(product, productDatabase)) {
			return total + calculateProductTotalAfterMarkup(product, quoteData, productDatabase)
		}
		return total
	}, 0)

	const addOnsTotal = quoteData.addOns.reduce((total, addOn) => total + calculateAddOnBaseTotal(addOn), 0)
	const customServicesTotal = quoteData.customServices.reduce(
		(total, service) => total + calculateCustomServiceBaseTotal(service),
		0,
	)

	return productsTotal + addOnsTotal + customServicesTotal
}

/**
 * Calculates the total GST for all products, add-ons, and services.
 * Only includes products with valid pricing.
 */
export const calculateTotalGST = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	if (!quoteData.gstEnabled) return 0

	const productsGST = quoteData.products.reduce((total, product) => {
		if (isProductPricingValid(product, productDatabase)) {
			return total + calculateProductGST(product, true, quoteData.gstRate, productDatabase, quoteData)
		}
		return total
	}, 0)

	const addOnsGST = quoteData.addOns.reduce(
		(total, addOn) => total + calculateAddOnGST(addOn, true, quoteData.gstRate),
		0,
	)
	const customServicesGST = quoteData.customServices.reduce(
		(total, service) => total + calculateCustomServiceGST(service, true, quoteData.gstRate),
		0,
	)

	return productsGST + addOnsGST + customServicesGST
}

/**
 * Calculates the total discount amount applied to the quote.
 * Supports percentage-based and fixed-value discounts.
 */
export const calculateDiscount = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	const subtotalWithMarkupAndGST =
		calculateSubtotalAfterMarkup(quoteData, productDatabase) + calculateTotalGST(quoteData, productDatabase)
	if (quoteData.discountType === 'percentage') {
		return subtotalWithMarkupAndGST * (quoteData.discountValue / 100)
	} else {
		return Math.min(quoteData.discountValue, subtotalWithMarkupAndGST)
	}
}

/**
 * Calculates the grand total of the quote after applying markup, GST, and discount.
 */
export const calculateTotal = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	const subtotalWithMarkupAndGST =
		calculateSubtotalAfterMarkup(quoteData, productDatabase) + calculateTotalGST(quoteData, productDatabase)
	const discount = calculateDiscount(quoteData, productDatabase)
	return subtotalWithMarkupAndGST - discount
}

/**
 * Gets a summary of products with invalid pricing for display purposes.
 */
export const getInvalidPricingProducts = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): Array<{
	id: string
	name: string
	reason: string
}> => {
	return quoteData.products
		.filter(product => !isProductPricingValid(product, productDatabase))
		.map(product => {
			const productInfo = productDatabase.products.find(p => p._id === product.productId)
			if (!productInfo) {
				return {
					id: product.id,
					name: product.label || 'Unknown Product',
					reason: 'Product not found in database',
				}
			}

			if (productInfo.priceType === 'matrix') {
				if (!productInfo.priceMatrix || productInfo.priceMatrix.length === 0) {
					return {
						id: product.id,
						name: productInfo.name,
						reason: 'No pricing matrix configured',
					}
				} else {
					return {
						id: product.id,
						name: productInfo.name,
						reason: `No pricing available for dimensions ${product.width}m × ${product.height}m`,
					}
				}
			}

			return {
				id: product.id,
				name: productInfo.name,
				reason: 'No base price configured',
			}
		})
}

export const calculateTax = (quoteData: QuoteData): number => {
	console.log(quoteData)
	return 0
}

export const calculateGST = (quoteData: QuoteData, productDatabase: ProductDatabase): number => {
	return calculateTotalGST(quoteData, productDatabase)
}
