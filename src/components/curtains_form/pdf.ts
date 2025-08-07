import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { QuoteCalculatedData, ProductDatabase } from './types' // Import ProductDatabase
// productDatabase will be passed as a parameter, no longer imported directly
// import { productDatabase } from "@/data/data"
import {
	calculateProductTotal,
	calculateProductGST,
	calculateRoomTotal,
	calculateRoomGST,
	calculateAddOnTotal,
	calculateAddOnGST,
	calculateServiceTotal,
	calculateServiceGST,
	calculateSubtotal,
	calculateDiscount,
	calculateTotalGST,
	calculateTotal,
} from './calculations'

interface PDFConfig {
	pageWidth: number
	pageHeight: number
	margin: number
	fontSize: {
		title: number
		heading: number
		subheading: number
		body: number
		small: number
	}
	colors: {
		primary: [number, number, number]
		secondary: [number, number, number]
		text: [number, number, number]
		muted: [number, number, number]
	}
	lineHeight: number
}

const PDF_CONFIG: PDFConfig = {
	pageWidth: 595.28, // A4 width in points
	pageHeight: 841.89, // A4 height in points
	margin: 50,
	fontSize: {
		title: 20,
		heading: 16,
		subheading: 14,
		body: 11,
		small: 9,
	},
	colors: {
		primary: [0.2, 0.2, 0.2], // Dark gray
		secondary: [0.4, 0.4, 0.4], // Medium gray
		text: [0.1, 0.1, 0.1], // Almost black
		muted: [0.6, 0.6, 0.6], // Light gray
	},
	lineHeight: 1.4,
}

class PDFBuilder {
	private doc: PDFDocument
	private currentPage: any
	private currentY: number
	private fonts: { [key: string]: any } = {}

	constructor(doc: PDFDocument) {
		this.doc = doc
		this.currentPage = doc.addPage([
			PDF_CONFIG.pageWidth,
			PDF_CONFIG.pageHeight,
		])
		this.currentY = PDF_CONFIG.pageHeight - PDF_CONFIG.margin
	}

	async loadFonts() {
		this.fonts.regular = await this.doc.embedFont(StandardFonts.Helvetica)
		this.fonts.bold = await this.doc.embedFont(StandardFonts.HelveticaBold)
	}

	private checkPageSpace(requiredHeight: number): void {
		if (this.currentY - requiredHeight < PDF_CONFIG.margin) {
			this.addNewPage()
		}
	}

	private addNewPage(): void {
		this.currentPage = this.doc.addPage([
			PDF_CONFIG.pageWidth,
			PDF_CONFIG.pageHeight,
		])
		this.currentY = PDF_CONFIG.pageHeight - PDF_CONFIG.margin
	}

	private drawText(
		text: string,
		x: number,
		fontSize: number,
		color: [number, number, number] = PDF_CONFIG.colors.text,
		font: 'regular' | 'bold' = 'regular',
	): void {
		this.currentPage.drawText(text, {
			x,
			y: this.currentY,
			size: fontSize,
			font: this.fonts[font],
			color: rgb(...color),
		})
	}

	private drawLine(
		text: string,
		fontSize: number,
		color: [number, number, number] = PDF_CONFIG.colors.text,
		font: 'regular' | 'bold' = 'regular',
		indent = 0,
	): void {
		const lineHeight = fontSize * PDF_CONFIG.lineHeight
		this.checkPageSpace(lineHeight)
		this.drawText(text, PDF_CONFIG.margin + indent, fontSize, color, font)
		this.currentY -= lineHeight
	}

	private drawTwoColumnLine(
		leftText: string,
		rightText: string,
		fontSize: number,
		color: [number, number, number] = PDF_CONFIG.colors.text,
		font: 'regular' | 'bold' = 'regular',
	): void {
		const lineHeight = fontSize * PDF_CONFIG.lineHeight
		this.checkPageSpace(lineHeight)

		this.drawText(leftText, PDF_CONFIG.margin, fontSize, color, font)

		const rightTextWidth = this.fonts[font].widthOfTextAtSize(
			rightText,
			fontSize,
		)
		const rightX = PDF_CONFIG.pageWidth - PDF_CONFIG.margin - rightTextWidth
		this.drawText(rightText, rightX, fontSize, color, font)

		this.currentY -= lineHeight
	}

	private addSpacing(multiplier = 1): void {
		this.currentY -=
			PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight * multiplier
	}

	drawTitle(text: string): void {
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.title,
			PDF_CONFIG.colors.primary,
			'bold',
		)
		this.addSpacing(0.5)
	}

	drawHeading(text: string): void {
		this.addSpacing(0.5)
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.heading,
			PDF_CONFIG.colors.primary,
			'bold',
		)
		this.addSpacing(0.3)
	}

	drawSubheading(text: string): void {
		this.addSpacing(0.3)
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.subheading,
			PDF_CONFIG.colors.secondary,
			'bold',
		)
		this.addSpacing(0.2)
	}

	drawBodyText(text: string, indent = 0): void {
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			'regular',
			indent,
		)
	}

	drawSmallText(text: string, indent = 0): void {
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.small,
			PDF_CONFIG.colors.muted,
			'regular',
			indent,
		)
	}

	drawTwoColumn(leftText: string, rightText: string, bold = false): void {
		this.drawTwoColumnLine(
			leftText,
			rightText,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			bold ? 'bold' : 'regular',
		)
	}

	drawTwoColumnSmall(leftText: string, rightText: string): void {
		this.drawTwoColumnLine(
			leftText,
			rightText,
			PDF_CONFIG.fontSize.small,
			PDF_CONFIG.colors.muted,
			'regular',
		)
	}
}

export async function generateQuotePDF(
	data: QuoteCalculatedData,
	productDatabase: ProductDatabase,
): Promise<Blob> {
	const { quoteData } = data
	const doc = await PDFDocument.create()
	const builder = new PDFBuilder(doc)

	await builder.loadFonts()

	// Title and Date
	builder.drawTitle('BLINDS QUOTATION')
	builder.drawBodyText(`Quote Date: ${quoteData.quoteDate}`)

	// Customer Information
	builder.drawHeading('Customer Information')
	builder.drawBodyText(`Name: ${quoteData.customer.name}`)
	builder.drawBodyText(`Email: ${quoteData.customer.email}`)
	builder.drawBodyText(`Phone: ${quoteData.customer.phone}`)

	if (quoteData.customer.address) {
		builder.drawBodyText(`Address: ${quoteData.customer.address}`)
	}

	if (quoteData.customer.projectAddress) {
		builder.drawBodyText(
			`Project Address: ${quoteData.customer.projectAddress}`,
		)
	}

	// Room Breakdown
	builder.drawHeading('Room Breakdown')

	for (const room of quoteData.rooms) {
		builder.drawSubheading(`${room.name} (${room.type})`)

		for (const product of room.products) {
			const productInfo = productDatabase.products.find(
				p => p._id === product.productId,
			) // Changed p.id to p._id
			const sqm = product.width * product.height
			const baseTotal = calculateProductTotal(
				product,
				false,
				0,
				productDatabase,
			)
			const gstAmount = calculateProductGST(
				product,
				quoteData.gstEnabled,
				quoteData.gstRate,
				productDatabase,
			)
			const totalWithGST = calculateProductTotal(
				product,
				quoteData.gstEnabled,
				quoteData.gstRate,
				productDatabase,
			)

			// Product name and total
			builder.drawTwoColumn(
				productInfo?.name || 'Unknown Product',
				`$${totalWithGST.toFixed(2)}`,
			)

			// Product details
			let details = ''
			if (productInfo?.priceType === 'sqm') {
				details = `${product.width}m × ${product.height}m (${sqm.toFixed(2)} sqm) × ${product.quantity}`
			} else {
				details = `Quantity: ${product.quantity}`
			}

			if (product.color !== 'White') {
				details += ` • ${product.color}`
			}
			if (product.controlType !== 'Cord') {
				details += ` • ${product.controlType}`
			}

			builder.drawSmallText(details, 20)

			// GST breakdown if enabled
			if (quoteData.gstEnabled && gstAmount > 0) {
				builder.drawSmallText(
					`Base: $${baseTotal.toFixed(2)} + GST: $${gstAmount.toFixed(2)}`,
					20,
				)
			}

			// Special features
			if (product.specialFeatures) {
				builder.drawSmallText(product.specialFeatures, 20)
			}
		}

		// Room total
		const roomTotal = calculateRoomTotal(
			room,
			quoteData.gstEnabled,
			quoteData.gstRate,
			productDatabase,
		)
		const roomGST = calculateRoomGST(
			room,
			quoteData.gstEnabled,
			quoteData.gstRate,
			productDatabase,
		)

		builder.drawTwoColumn(`Room Total:`, `$${roomTotal.toFixed(2)}`, true)

		if (quoteData.gstEnabled && roomGST > 0) {
			builder.drawTwoColumnSmall(`(GST: $${roomGST.toFixed(2)})`, '')
		}
	}

	// Additional Items & Services
	const hasAdditionalItems =
		quoteData.addOns.length > 0 ||
		quoteData.installationService ||
		quoteData.siteMeasurement ||
		quoteData.deliveryOption === 'express'

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		// Add-ons
		for (const addOn of quoteData.addOns) {
			const baseTotal = addOn.quantity * addOn.unitPrice
			const gstAmount = calculateAddOnGST(
				addOn,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)
			const totalWithGST = calculateAddOnTotal(
				addOn,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)

			builder.drawTwoColumn(
				`${addOn.name} (${addOn.quantity} × $${addOn.unitPrice})`,
				`$${totalWithGST.toFixed(2)}`,
			)

			if (quoteData.gstEnabled && gstAmount > 0) {
				builder.drawSmallText(
					`Base: $${baseTotal.toFixed(2)} + GST: $${gstAmount.toFixed(2)}`,
					20,
				)
			}
		}

		// Services
		if (quoteData.installationService) {
			const serviceTotal = calculateServiceTotal(
				150,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)
			const serviceGST = calculateServiceGST(
				150,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)

			builder.drawTwoColumn(
				'Installation Service',
				`$${serviceTotal.toFixed(2)}`,
			)

			if (quoteData.gstEnabled && serviceGST > 0) {
				builder.drawSmallText(
					`Base: $150.00 + GST: $${serviceGST.toFixed(2)}`,
					20,
				)
			}
		}

		if (quoteData.siteMeasurement) {
			const serviceTotal = calculateServiceTotal(
				75,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)
			const serviceGST = calculateServiceGST(
				75,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)

			builder.drawTwoColumn('Site Measurement', `$${serviceTotal.toFixed(2)}`)

			if (quoteData.gstEnabled && serviceGST > 0) {
				builder.drawSmallText(
					`Base: $75.00 + GST: $${serviceGST.toFixed(2)}`,
					20,
				)
			}
		}

		if (quoteData.deliveryOption === 'express') {
			const serviceTotal = calculateServiceTotal(
				50,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)
			const serviceGST = calculateServiceGST(
				50,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)

			builder.drawTwoColumn('Express Delivery', `$${serviceTotal.toFixed(2)}`)

			if (quoteData.gstEnabled && serviceGST > 0) {
				builder.drawSmallText(
					`Base: $50.00 + GST: $${serviceGST.toFixed(2)}`,
					20,
				)
			}
		}
	}

	// Pricing Summary
	builder.drawHeading('Pricing Summary')

	const subtotal = calculateSubtotal(quoteData, productDatabase)
	const discount = calculateDiscount(quoteData, productDatabase)
	const totalGST = calculateTotalGST(quoteData, productDatabase)
	const total = calculateTotal(quoteData, productDatabase)

	builder.drawTwoColumn(
		`Subtotal ${quoteData.gstEnabled ? '(incl. GST)' : ''}:`,
		`$${subtotal.toFixed(2)}`,
	)

	if (quoteData.gstEnabled && totalGST > 0) {
		builder.drawTwoColumn(
			`Total GST (${quoteData.gstRate}%):`,
			`$${totalGST.toFixed(2)}`,
		)
	}

	if (discount > 0) {
		const discountLabel =
			quoteData.discountType === 'percentage'
				? `Discount (${quoteData.discountValue}%)`
				: `$${quoteData.discountValue}`

		const fullDiscountLabel = quoteData.discountReason
			? `${discountLabel} - ${quoteData.discountReason}:`
			: `${discountLabel}:`

		builder.drawTwoColumn(fullDiscountLabel, `-$${discount.toFixed(2)}`)
	}

	builder.drawTwoColumn('TOTAL:', `$${total.toFixed(2)}`, true)

	// Payment Terms and Notes
	builder.drawHeading('Terms & Conditions')
	builder.drawBodyText(`Payment Terms: ${quoteData.paymentTerms}`)

	if (quoteData.gstEnabled) {
		builder.drawBodyText(
			`All prices include GST (${quoteData.gstRate}%) as requested.`,
		)
	}

	// Footer
	builder.drawSmallText('Thank you for your business!')
	builder.drawSmallText(
		`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
	)

	const pdfBytes = await doc.save()
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
