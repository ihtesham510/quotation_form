import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { SelfContainedQuoteData } from './types'

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
	pageWidth: 595.28,
	pageHeight: 841.89,
	margin: 50,
	fontSize: {
		title: 20,
		heading: 16,
		subheading: 14,
		body: 11,
		small: 9,
	},
	colors: {
		primary: [0.2, 0.2, 0.2],
		secondary: [0.4, 0.4, 0.4],
		text: [0.1, 0.1, 0.1],
		muted: [0.6, 0.6, 0.6],
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
		this.addSpacing(1.5)
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.heading,
			PDF_CONFIG.colors.primary,
			'bold',
		)
		this.addSpacing(0.1)
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

	drawDescriptionText(text: string, indent = -1): void {
		this.drawLine(
			text,
			PDF_CONFIG.fontSize.small,
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
	data: SelfContainedQuoteData,
): Promise<Blob> {
	const doc = await PDFDocument.create()
	const builder = new PDFBuilder(doc)

	await builder.loadFonts()

	builder.drawTitle('BLINDS QUOTATION')
	builder.drawBodyText(`Quote Date: ${data.quoteDate}`)

	builder.drawHeading('Customer Information')
	builder.drawBodyText(`Name: ${data.customer.name}`)
	builder.drawBodyText(`Email: ${data.customer.email}`)
	builder.drawBodyText(`Phone: ${data.customer.phone}`)

	if (data.customer.address) {
		builder.drawBodyText(`Address: ${data.customer.address}`)
	}

	if (data.customer.projectAddress) {
		builder.drawBodyText(`Project Address: ${data.customer.projectAddress}`)
	}

	builder.drawHeading('Product Breakdown')

	if (data.products.length === 0) {
		builder.drawBodyText('No products added to this quote.')
	} else {
		for (const product of data.products) {
			const sqm = product.width * product.height

			builder.drawTwoColumn(product.name, `$${product.total.toFixed(2)}`)

			let details = ''
			if (product.priceType === 'sqm') {
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

			if (product.effectivePrice !== product.basePrice) {
				builder.drawSmallText(
					`Original Price: $${product.basePrice.toFixed(2)} ${product.priceType === 'sqm' ? '/sqm' : '/each'} • Marked Up: $${product.effectivePrice.toFixed(2)} ${product.priceType === 'sqm' ? '/sqm' : '/each'}`,
					20,
				)
			}

			if (data.pricing.gstEnabled && product.gstAmount > 0) {
				builder.drawSmallText(
					`Base: $${(product.total - product.gstAmount).toFixed(2)} + GST: $${product.gstAmount.toFixed(2)}`,
					20,
				)
			}

			if (product.specialFeatures) {
				builder.drawDescriptionText(product.specialFeatures, 10)
			}
		}
	}

	const hasAdditionalItems =
		data.addOns.length > 0 || data.customServices.length > 0

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		for (const addOn of data.addOns) {
			let addOnDetails = `${addOn.name} (${addOn.quantity} × $${addOn.unitPrice.toFixed(2)} ${addOn.unitType})`

			if (addOn.unitType === 'sqm' && addOn.width && addOn.height) {
				addOnDetails += ` (${addOn.width.toFixed(2)}m × ${addOn.height.toFixed(2)}m)`
			} else if (addOn.unitType === 'linear' && addOn.length) {
				addOnDetails += ` (${addOn.length.toFixed(2)}m)`
			}

			builder.drawTwoColumn(addOnDetails, `$${addOn.total.toFixed(2)}`)

			if (addOn.description) {
				builder.drawSmallText(addOn.description, 20)
			}

			if (data.pricing.gstEnabled && addOn.gstAmount > 0) {
				builder.drawSmallText(
					`Base: $${(addOn.total - addOn.gstAmount).toFixed(2)} + GST: $${addOn.gstAmount.toFixed(2)}`,
					20,
				)
			}
		}

		for (const service of data.customServices) {
			builder.drawTwoColumn(`${service.name}`, `$${service.total.toFixed(2)}`)

			if (service.description) {
				builder.drawSmallText(service.description, 20)
			}

			if (data.pricing.gstEnabled && service.gstAmount > 0) {
				builder.drawSmallText(
					`Base: $${(service.total - service.gstAmount).toFixed(2)} + GST: $${service.gstAmount.toFixed(2)}`,
					20,
				)
			}
		}
	}

	builder.drawHeading('Pricing Summary')

	builder.drawTwoColumn(
		`Subtotal:`,
		`$${(data.pricing.subtotalBeforeMarkupAndDiscount + data.pricing.totalMarkup).toFixed(2)}`,
	)

	if (data.pricing.gstEnabled && data.pricing.totalGST > 0) {
		builder.drawTwoColumn(
			`Total GST (${data.pricing.gstRate}%):`,
			`$${data.pricing.totalGST.toFixed(2)}`,
		)
	}

	if (data.pricing.discountAmount > 0) {
		const discountLabel =
			data.pricing.discountType === 'percentage'
				? `Discount (${data.pricing.discountValue}%)`
				: `$${data.pricing.discountValue}`

		const fullDiscountLabel = data.pricing.discountReason
			? `${discountLabel} - ${data.pricing.discountReason}:`
			: `${discountLabel}:`

		builder.drawTwoColumn(
			fullDiscountLabel,
			`-$${data.pricing.discountAmount.toFixed(2)}`,
		)
	}

	builder.drawTwoColumn(
		'TOTAL:',
		`$${data.pricing.grandTotal.toFixed(2)}`,
		true,
	)

	builder.drawSmallText('Thank you for your business!')
	builder.drawSmallText(
		`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
	)

	const pdfBytes = await doc.save()
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
