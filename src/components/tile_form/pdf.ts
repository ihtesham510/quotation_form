import { PDFBuilder } from '@/lib/pdf'
import { PDFDocument } from 'pdf-lib'
import type { QuotationData } from './types'

export async function generateTileQuotePDF(data: QuotationData): Promise<Blob> {
	const doc = await PDFDocument.create()
	const builder = new PDFBuilder(doc)

	await builder.loadFonts()

	// Title
	builder.drawTitle('TILE QUOTATION')
	builder.drawBodyText(`Quote Date: ${new Date().toLocaleDateString()}`)

	// Customer Information
	builder.drawHeading('Customer Information')
	builder.drawBodyText(`Name: ${data.customerInfo.name}`)
	builder.drawBodyText(`Email: ${data.customerInfo.email}`)
	builder.drawBodyText(`Phone: ${data.customerInfo.phone}`)
	builder.drawBodyText(`Customer Address: ${data.customerInfo.customerAddress}`)

	if (data.customerInfo.projectAddress) {
		builder.drawBodyText(`Project Address: ${data.customerInfo.projectAddress}`)
	}

	// Material Items
	builder.drawHeading('Material Selection')

	if (data.selections.materialItems.length === 0) {
		builder.drawBodyText('No materials selected for this quote.')
	} else {
		for (const item of data.selections.materialItems) {
			// Calculate item total
			let itemTotal = 0
			let basePrice = 0
			let details = []

			if (item.material) {
				basePrice = item.material.basePrice
				let effectivePrice = basePrice

				// Apply style multiplier
				if (item.style) {
					effectivePrice *= item.style.multiplier
					details.push(`Style: ${item.style.name}`)
				}

				// Apply size multiplier
				if (item.size) {
					effectivePrice *= item.size.multiplier
					details.push(`Size: ${item.size.name}`)
				}

				// Apply finish premium
				if (item.finish) {
					effectivePrice += item.finish.premium
					details.push(`Finish: ${item.finish.name}`)
				}

				itemTotal = effectivePrice * item.squareFootage
			}

			builder.drawBoldText(item.label)
			if (item.material) {
				builder.drawTwoColumn(item.material.name, `$${itemTotal.toFixed(2)}`)
			}

			builder.drawSmallText(`Square Footage: ${item.squareFootage} sqft`, 20)

			if (details.length > 0) {
				builder.drawSmallText(details.join(' • '), 20)
			}

			if (basePrice > 0 && item.material) {
				builder.drawSmallText(`Base Price: $${basePrice.toFixed(2)}/sqft`, 20)
			}
		}
	}

	// Custom Items and Services
	const hasAdditionalItems = data.addOns.customItems.length > 0 || data.addOns.customServices.length > 0

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		// Custom Items
		for (const item of data.addOns.customItems) {
			let itemDetails = `${item.name} (${item.quantity} × $${item.price.toFixed(2)} ${item.unit})`
			const itemTotal = item.price * item.quantity

			if (item.measurement) {
				itemDetails += ` (${item.measurement} ${item.unit})`
			}

			builder.drawTwoColumn(itemDetails, `$${itemTotal.toFixed(2)}`)
		}

		// Custom Services
		for (const service of data.addOns.customServices) {
			builder.drawTwoColumn(service.name, `$${service.price.toFixed(2)}`)
		}
	}

	// Pricing Summary
	builder.drawHeading('Pricing Summary')

	builder.drawTwoColumn('Materials Cost:', `$${(data.pricing.materialCost + data.pricing.markupAmount).toFixed(2)}`)

	if (data.pricing.customItemsCost > 0) {
		builder.drawTwoColumn('Custom Items:', `$${data.pricing.customItemsCost.toFixed(2)}`)
	}

	if (data.pricing.customServicesCost > 0) {
		builder.drawTwoColumn('Custom Services:', `$${data.pricing.customServicesCost.toFixed(2)}`)
	}

	builder.drawTwoColumn('Subtotal:', `$${data.pricing.subtotal.toFixed(2)}`)

	if (data.pricingOptions.discount.enabled && data.pricing.discountAmount > 0) {
		builder.drawTwoColumn(
			`Discount (${data.pricingOptions.discount.value}%):`,
			`-$${data.pricing.discountAmount.toFixed(2)}`,
		)

		builder.drawTwoColumn('After Discount:', `$${data.pricing.afterDiscount.toFixed(2)}`)
	}

	if (data.pricingOptions.gst.enabled && data.pricing.gstAmount > 0) {
		builder.drawTwoColumn(`GST (${data.pricingOptions.gst.percentage}%):`, `$${data.pricing.gstAmount.toFixed(2)}`)

		// GST Breakdown if available
		if (data.pricing.breakdown.tileGST > 0) {
			builder.drawSmallText(`Tile GST: $${data.pricing.breakdown.tileGST.toFixed(2)}`, 20)
		}
		if (data.pricing.breakdown.customItemsGST > 0) {
			builder.drawSmallText(`Custom Items GST: $${data.pricing.breakdown.customItemsGST.toFixed(2)}`, 20)
		}
		if (data.pricing.breakdown.customServicesGST > 0) {
			builder.drawSmallText(`Custom Services GST: $${data.pricing.breakdown.customServicesGST.toFixed(2)}`, 20)
		}
	}

	builder.drawTwoColumn('TOTAL:', `$${data.pricing.finalTotal.toFixed(2)}`, true)

	// Footer
	builder.drawSmallText('Thank you for choosing us for your tiling project!')
	builder.drawSmallText(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`)

	const pdfBytes = await doc.save()
	// @ts-ignore
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
