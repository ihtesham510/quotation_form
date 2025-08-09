import type {
	QuoteProduct,
	AddOn,
	CustomService,
	ProductDatabase,
	QuoteData,
} from './types'

/**
 * Calculates the original base price of a product before any markup or GST.
 * If a custom price is set on the product, it is used; otherwise, the product's base price from the database is used.
 * Returns 0 if the product is not found.
 */
export const calculateProductOriginalBasePrice = (
	product: QuoteProduct,
	productDatabase: ProductDatabase,
): number => {
	const productInfo = productDatabase.products.find(
		p => p._id === product.productId,
	)
	return product.customPrice || productInfo?.basePrice || 0
}

/**
 * Calculates the total base price of a product before markup or GST.
 * If the product is priced by area (sqm), it uses the greater of the actual area or the minimum quantity.
 */
export const calculateProductBaseTotal = (
	product: QuoteProduct,
	productDatabase: ProductDatabase,
): number => {
	const productInfo = productDatabase.products.find(
		p => p._id === product.productId,
	)
	if (!productInfo) return 0

	const originalPrice = calculateProductOriginalBasePrice(
		product,
		productDatabase,
	)

	const sqm = product.width * product.height
	let baseTotal = 0
	if (productInfo.priceType === 'sqm') {
		const minSqm = productInfo.minimumQty
		const billableSqm = Math.max(sqm, minSqm)
		baseTotal = billableSqm * originalPrice * product.quantity
	} else {
		baseTotal = originalPrice * product.quantity
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
		baseTotal =
			addOn.unitPrice *
			addOn.quantity *
			(addOn.width || 0) *
			(addOn.height || 0)
	} else if (addOn.unitType === 'linear') {
		baseTotal = addOn.unitPrice * addOn.quantity * (addOn.length || 0)
	} else {
		// "each"
		baseTotal = addOn.unitPrice * addOn.quantity
	}
	return baseTotal
}

/**
 * Returns the base price for a custom service (already fixed).
 * No quantity or unit calculation is performed.
 */
export const calculateCustomServiceBaseTotal = (
	service: CustomService,
): number => {
	return service.price
}

/**
 * Calculates the subtotal of all items before applying any markup, GST, or discounts.
 * Includes products, add-ons, and custom services.
 */
export const calculateSubtotalBeforeAll = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const productsTotal = quoteData.products.reduce(
		(total, product) =>
			total + calculateProductBaseTotal(product, productDatabase),
		0,
	)
	const addOnsTotal = quoteData.addOns.reduce(
		(total, addOn) => total + calculateAddOnBaseTotal(addOn),
		0,
	)
	const customServicesTotal = quoteData.customServices.reduce(
		(total, service) => total + calculateCustomServiceBaseTotal(service),
		0,
	)

	return productsTotal + addOnsTotal + customServicesTotal
}

/**
 * Calculates the effective price of a product after applying markup.
 * Supports percentage or fixed value markup.
 */
export const calculateProductEffectiveBasePrice = (
	product: QuoteProduct,
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const originalPrice = calculateProductOriginalBasePrice(
		product,
		productDatabase,
	)
	let effectivePrice = originalPrice

	if (quoteData.markupEnabled) {
		if (quoteData.markupType === 'percentage') {
			effectivePrice = originalPrice * (1 + quoteData.markupValue / 100)
		} else {
			// fixed
			effectivePrice = originalPrice + quoteData.markupValue
		}
	}
	return effectivePrice
}

/**
 * Calculates the total cost of a product after applying markup but before GST.
 * Handles area-based and quantity-based pricing.
 */
export const calculateProductTotalAfterMarkup = (
	product: QuoteProduct,
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const productInfo = productDatabase.products.find(
		p => p._id === product.productId,
	)
	if (!productInfo) return 0

	const effectivePrice = calculateProductEffectiveBasePrice(
		product,
		quoteData,
		productDatabase,
	)

	const sqm = product.width * product.height
	let total = 0
	if (productInfo.priceType === 'sqm') {
		const minSqm = productInfo.minimumQty
		const billableSqm = Math.max(sqm, minSqm)
		total = billableSqm * effectivePrice * product.quantity
	} else {
		total = effectivePrice * product.quantity
	}
	return total
}

/**
 * Calculates the final total price for a product after applying markup and GST.
 */
export const calculateProductTotal = (
	product: QuoteProduct,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
	quoteData: QuoteData,
): number => {
	let total = calculateProductTotalAfterMarkup(
		product,
		quoteData,
		productDatabase,
	)
	if (gstEnabled) {
		total = total * (1 + gstRate / 100)
	}
	return total
}

/**
 * Calculates the GST amount for a product based on its total price after markup.
 */
export const calculateProductGST = (
	product: QuoteProduct,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
	quoteData: QuoteData,
): number => {
	if (!gstEnabled) return 0
	const baseValue = calculateProductTotalAfterMarkup(
		product,
		quoteData,
		productDatabase,
	)
	return baseValue * (gstRate / 100)
}

/**
 * Calculates the total price for an add-on including GST if applicable.
 */
export const calculateAddOnTotal = (
	addOn: AddOn,
	gstEnabled = false,
	gstRate = 0,
): number => {
	let total = calculateAddOnBaseTotal(addOn)
	if (gstEnabled) {
		total = total * (1 + gstRate / 100)
	}
	return total
}

/**
 * Calculates the GST portion for an add-on.
 */
export const calculateAddOnGST = (
	addOn: AddOn,
	gstEnabled = false,
	gstRate = 0,
): number => {
	if (!gstEnabled) return 0
	const baseValue = calculateAddOnBaseTotal(addOn)
	return baseValue * (gstRate / 100)
}

/**
 * Calculates the total price for a custom service including GST if applicable.
 */
export const calculateCustomServiceTotal = (
	service: CustomService,
	gstEnabled = false,
	gstRate = 0,
): number => {
	let total = calculateCustomServiceBaseTotal(service)
	if (gstEnabled) {
		total = total * (1 + gstRate / 100)
	}
	return total
}

/**
 * Calculates the GST amount for a custom service.
 */
export const calculateCustomServiceGST = (
	service: CustomService,
	gstEnabled = false,
	gstRate = 0,
): number => {
	if (!gstEnabled) return 0
	const baseValue = calculateCustomServiceBaseTotal(service)
	return baseValue * (gstRate / 100)
}

/**
 * Calculates the total markup added to all products in the quote.
 * This is the total extra amount charged due to markup (either percentage or fixed).
 */
export const calculateTotalMarkup = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	if (!quoteData.markupEnabled) return 0

	let totalMarkup = 0
	quoteData.products.forEach(product => {
		const originalBasePrice = calculateProductOriginalBasePrice(
			product,
			productDatabase,
		)
		const effectivePrice = calculateProductEffectiveBasePrice(
			product,
			quoteData,
			productDatabase,
		)

		const priceDifferencePerUnit = effectivePrice - originalBasePrice

		const productInfo = productDatabase.products.find(
			p => p._id === product.productId,
		)
		if (!productInfo) return

		if (productInfo.priceType === 'sqm') {
			const sqm = product.width * product.height
			const minSqm = productInfo.minimumQty
			const billableSqm = Math.max(sqm, minSqm)
			totalMarkup += priceDifferencePerUnit * billableSqm * product.quantity
		} else {
			totalMarkup += priceDifferencePerUnit * product.quantity
		}
	})
	return totalMarkup
}

/**
 * Calculates the subtotal of all items after applying markup but before GST and discount.
 */
export const calculateSubtotalAfterMarkup = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const productsTotal = quoteData.products.reduce(
		(total, product) =>
			total +
			calculateProductTotalAfterMarkup(product, quoteData, productDatabase),
		0,
	)
	const addOnsTotal = quoteData.addOns.reduce(
		(total, addOn) => total + calculateAddOnBaseTotal(addOn), // Add-ons don't have markup
		0,
	)
	const customServicesTotal = quoteData.customServices.reduce(
		(total, service) => total + calculateCustomServiceBaseTotal(service), // Custom services don't have markup
		0,
	)

	return productsTotal + addOnsTotal + customServicesTotal
}

/**
 * Calculates the total GST for all products, add-ons, and services.
 */
export const calculateTotalGST = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	if (!quoteData.gstEnabled) return 0

	const productsGST = quoteData.products.reduce(
		(total, product) =>
			total +
			calculateProductGST(
				product,
				true,
				quoteData.gstRate,
				productDatabase,
				quoteData,
			),
		0,
	)
	const addOnsGST = quoteData.addOns.reduce(
		(total, addOn) => total + calculateAddOnGST(addOn, true, quoteData.gstRate),
		0,
	)
	const customServicesGST = quoteData.customServices.reduce(
		(total, service) =>
			total + calculateCustomServiceGST(service, true, quoteData.gstRate),
		0,
	)

	return productsGST + addOnsGST + customServicesGST
}

/**
 * Calculates the total discount amount applied to the quote.
 * Supports percentage-based and fixed-value discounts.
 */
export const calculateDiscount = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	// Discount is applied to the subtotal that includes markup and GST
	const subtotalWithMarkupAndGST =
		calculateSubtotalAfterMarkup(quoteData, productDatabase) +
		calculateTotalGST(quoteData, productDatabase)
	if (quoteData.discountType === 'percentage') {
		return subtotalWithMarkupAndGST * (quoteData.discountValue / 100)
	} else {
		return Math.min(quoteData.discountValue, subtotalWithMarkupAndGST)
	}
}

/**
 * Calculates the grand total of the quote after applying markup, GST, and discount.
 */
export const calculateTotal = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const subtotalWithMarkupAndGST =
		calculateSubtotalAfterMarkup(quoteData, productDatabase) +
		calculateTotalGST(quoteData, productDatabase)
	const discount = calculateDiscount(quoteData, productDatabase)
	return subtotalWithMarkupAndGST - discount
}

export const calculateTax = (quoteData: QuoteData): number => {
	console.log(quoteData)
	return 0
}

export const calculateGST = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	return calculateTotalGST(quoteData, productDatabase)
}
