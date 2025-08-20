import { PDFDocument } from 'pdf-lib'
import { PDFBuilder } from '@/lib/pdf'
import type { SelfContainedQuoteData } from './types'

export async function generateQuotePDF(data: SelfContainedQuoteData): Promise<Blob> {
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

			builder.drawBoldText(product.label)
			builder.drawTwoColumn(product.name, `$${product.total.toFixed(2)}`)
			builder.drawDescriptionText(`NOTE :${product.specialFeatures}`)

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
		}
	}

	const hasAdditionalItems = data.addOns.length > 0 || data.customServices.length > 0

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
		builder.drawTwoColumn(`Total GST (${data.pricing.gstRate}%):`, `$${data.pricing.totalGST.toFixed(2)}`)
	}

	if (data.pricing.discountAmount > 0) {
		const discountLabel =
			data.pricing.discountType === 'percentage'
				? `Discount (${data.pricing.discountValue}%)`
				: `$${data.pricing.discountValue}`

		const fullDiscountLabel = data.pricing.discountReason
			? `${discountLabel} - ${data.pricing.discountReason}:`
			: `${discountLabel}:`

		builder.drawTwoColumn(fullDiscountLabel, `-$${data.pricing.discountAmount.toFixed(2)}`)
	}

	builder.drawTwoColumn('TOTAL:', `$${data.pricing.grandTotal.toFixed(2)}`, true)

	builder.drawSmallText('Thank you for your business!')
	builder.drawSmallText(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`)

	const pdfBytes = await doc.save()
	// @ts-ignore
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
