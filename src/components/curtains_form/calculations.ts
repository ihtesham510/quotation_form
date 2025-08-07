import type {
	QuoteData,
	RoomProduct,
	Room,
	AddOn,
	ProductDatabase,
} from './types'

export const calculateProductTotal = (
	product: RoomProduct,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
): number => {
	const productInfo = productDatabase.products.find(
		p => p._id === product.productId,
	) // Changed p.id to p._id
	if (!productInfo) return 0

	const sqm = product.width * product.height
	const price = product.customPrice || productInfo.basePrice

	let baseTotal = 0
	if (productInfo.priceType === 'sqm') {
		const minSqm = productInfo.minimumQty
		const billableSqm = Math.max(sqm, minSqm)
		baseTotal = billableSqm * price * product.quantity
	} else {
		baseTotal = price * product.quantity
	}

	// Add GST to the base total if enabled
	if (gstEnabled) {
		baseTotal = baseTotal * (1 + gstRate / 100)
	}

	return baseTotal
}

export const calculateProductGST = (
	product: RoomProduct,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
): number => {
	if (!gstEnabled) return 0

	const productInfo = productDatabase.products.find(
		p => p._id === product.productId,
	)
	if (!productInfo) return 0

	const sqm = product.width * product.height
	const price = product.customPrice || productInfo.basePrice

	let baseTotal = 0
	if (productInfo.priceType === 'sqm') {
		const minSqm = productInfo.minimumQty
		const billableSqm = Math.max(sqm, minSqm)
		baseTotal = billableSqm * price * product.quantity
	} else {
		baseTotal = price * product.quantity
	}

	return baseTotal * (gstRate / 100)
}

export const calculateAddOnTotal = (
	addOn: AddOn,
	gstEnabled = false,
	gstRate = 0,
): number => {
	let baseTotal = addOn.unitPrice * addOn.quantity

	// Add GST to the base total if enabled
	if (gstEnabled) {
		baseTotal = baseTotal * (1 + gstRate / 100)
	}

	return baseTotal
}

export const calculateAddOnGST = (
	addOn: AddOn,
	gstEnabled = false,
	gstRate = 0,
): number => {
	if (!gstEnabled) return 0
	return addOn.unitPrice * addOn.quantity * (gstRate / 100)
}

export const calculateServiceTotal = (
	servicePrice: number,
	gstEnabled = false,
	gstRate = 0,
): number => {
	let total = servicePrice

	// Add GST to the service price if enabled
	if (gstEnabled) {
		total = total * (1 + gstRate / 100)
	}

	return total
}

export const calculateServiceGST = (
	servicePrice: number,
	gstEnabled = false,
	gstRate = 0,
): number => {
	if (!gstEnabled) return 0
	return servicePrice * (gstRate / 100)
}

export const calculateRoomTotal = (
	room: Room,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
): number => {
	return room.products.reduce(
		(total, product) =>
			total +
			calculateProductTotal(product, gstEnabled, gstRate, productDatabase),
		0,
	)
}

export const calculateRoomGST = (
	room: Room,
	gstEnabled = false,
	gstRate = 0,
	productDatabase: ProductDatabase,
): number => {
	return room.products.reduce(
		(total, product) =>
			total +
			calculateProductGST(product, gstEnabled, gstRate, productDatabase),
		0,
	)
}

export const calculateSubtotal = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const roomsTotal = quoteData.rooms.reduce(
		(total, room) =>
			total +
			calculateRoomTotal(
				room,
				quoteData.gstEnabled,
				quoteData.gstRate,
				productDatabase,
			),
		0,
	)
	const addOnsTotal = quoteData.addOns.reduce(
		(total, addOn) =>
			total +
			calculateAddOnTotal(addOn, quoteData.gstEnabled, quoteData.gstRate),
		0,
	)

	let servicesTotal = 0
	if (quoteData.installationService)
		servicesTotal += calculateServiceTotal(
			150,
			quoteData.gstEnabled,
			quoteData.gstRate,
		)
	if (quoteData.siteMeasurement)
		servicesTotal += calculateServiceTotal(
			75,
			quoteData.gstEnabled,
			quoteData.gstRate,
		)
	if (quoteData.deliveryOption === 'express')
		servicesTotal += calculateServiceTotal(
			50,
			quoteData.gstEnabled,
			quoteData.gstRate,
		)

	return roomsTotal + addOnsTotal + servicesTotal
}

export const calculateTotalGST = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	if (!quoteData.gstEnabled) return 0

	const roomsGST = quoteData.rooms.reduce(
		(total, room) =>
			total +
			calculateRoomGST(
				room,
				quoteData.gstEnabled,
				quoteData.gstRate,
				productDatabase,
			),
		0,
	)
	const addOnsGST = quoteData.addOns.reduce(
		(total, addOn) =>
			total + calculateAddOnGST(addOn, quoteData.gstEnabled, quoteData.gstRate),
		0,
	)

	let servicesGST = 0
	if (quoteData.installationService)
		servicesGST += calculateServiceGST(
			150,
			quoteData.gstEnabled,
			quoteData.gstRate,
		)
	if (quoteData.siteMeasurement)
		servicesGST += calculateServiceGST(
			75,
			quoteData.gstEnabled,
			quoteData.gstRate,
		)
	if (quoteData.deliveryOption === 'express')
		servicesGST += calculateServiceGST(
			50,
			quoteData.gstEnabled,
			quoteData.gstRate,
		)

	return roomsGST + addOnsGST + servicesGST
}

export const calculateDiscount = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	const subtotal = calculateSubtotal(quoteData, productDatabase)
	if (quoteData.discountType === 'percentage') {
		return subtotal * (quoteData.discountValue / 100)
	} else {
		return Math.min(quoteData.discountValue, subtotal)
	}
}

export const calculateTotal = (
	quoteData: QuoteData,
	productDatabase: ProductDatabase,
): number => {
	return (
		calculateSubtotal(quoteData, productDatabase) -
		calculateDiscount(quoteData, productDatabase)
	)
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
