import { PDFDocument } from 'pdf-lib'
import { PDFBuilder } from '@/lib/pdf'
import type { SelfContainedQuoteData } from './types'

export async function generateQuotePDF(data: SelfContainedQuoteData): Promise<Blob> {
	const doc = await PDFDocument.create()
	const builder = new PDFBuilder(doc)

	await builder.loadFonts()

	// Enhanced Title with colored header box
	builder.drawTitle('BLINDS QUOTATION')
	builder.drawKeyValueBox('Quote Date', data.quoteDate)

	// Customer Information Section with structured key-value boxes
	builder.drawHeading('Customer Information')

	builder.drawKeyValueBox('Name', data.customer.name)
	builder.drawKeyValueBox('Email', data.customer.email)
	builder.drawKeyValueBox('Phone', data.customer.phone)

	if (data.customer.address) {
		builder.drawKeyValueBox('Address', data.customer.address)
	}

	if (data.customer.projectAddress) {
		builder.drawKeyValueBox('Project Address', data.customer.projectAddress)
	}

	// Product Breakdown Section with enhanced table layout
	builder.drawHeading('Product Breakdown')

	if (data.products.length === 0) {
		builder.drawInfoBox('No products added to this quote.', 'warning')
	} else {
		// Create products table
		const productHeaders = ['Product', 'Dimensions', 'Qty', 'Unit Price', 'Total']
		const productRows: string[][] = []

		for (const product of data.products) {
			const sqm = product.width * product.height

			// Main product row
			let dimensions = ''
			if (product.priceType === 'sqm') {
				dimensions = `${product.width}m × ${product.height}m\n(${sqm.toFixed(2)} sqm)`
			} else {
				dimensions = 'Per Unit'
			}

			productRows.push([
				product.name,
				dimensions,
				product.quantity.toString(),
				`$${product.effectivePrice.toFixed(2)}${product.priceType === 'sqm' ? '/sqm' : '/each'}`,
				`$${product.total.toFixed(2)}`,
			])

			// Product details row
			let details = []
			if (product.label && product.label !== product.name) {
				details.push(`Label: ${product.label}`)
			}
			if (product.color !== 'White') {
				details.push(`Color: ${product.color}`)
			}
			if (product.controlType !== 'Cord') {
				details.push(`Control: ${product.controlType}`)
			}
			if (product.specialFeatures) {
				details.push(`Features: ${product.specialFeatures}`)
			}

			if (details.length > 0) {
				productRows.push([
					'', // Empty product column
					`↳ ${details.join(' • ')}`, // Details span dimensions column
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}

			// Pricing breakdown row if applicable
			if (product.effectivePrice !== product.basePrice) {
				productRows.push([
					'', // Empty product column
					`↳ Original: $${product.basePrice.toFixed(2)} → Marked Up: $${product.effectivePrice.toFixed(2)}`,
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}

			// GST breakdown row if applicable
			if (data.pricing.gstEnabled && product.gstAmount > 0) {
				productRows.push([
					'', // Empty product column
					`↳ Base: $${(product.total - product.gstAmount).toFixed(2)} + GST: $${product.gstAmount.toFixed(2)}`,
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}
		}

		// Draw products table with custom column widths
		const productColumnWidths = [140, 140, 50, 80, 80]
		builder.drawTable(productHeaders, productRows, productColumnWidths)
	}

	// Additional Items & Services Section
	const hasAdditionalItems = data.addOns.length > 0 || data.customServices.length > 0

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		// Add-ons Table
		if (data.addOns.length > 0) {
			builder.drawSubheading('Additional Items')
			const addOnHeaders = ['Item', 'Description', 'Quantity', 'Unit Price', 'Total']
			const addOnRows: string[][] = []

			for (const addOn of data.addOns) {
				let description = `${addOn.unitType}`

				if (addOn.unitType === 'sqm' && addOn.width && addOn.height) {
					description += ` (${addOn.width.toFixed(2)}m × ${addOn.height.toFixed(2)}m)`
				} else if (addOn.unitType === 'linear' && addOn.length) {
					description += ` (${addOn.length.toFixed(2)}m)`
				}

				addOnRows.push([
					addOn.name,
					description,
					addOn.quantity.toString(),
					`$${addOn.unitPrice.toFixed(2)}`,
					`$${addOn.total.toFixed(2)}`,
				])

				// Add description row if available
				if (addOn.description) {
					addOnRows.push([
						'', // Empty item
						`↳ ${addOn.description}`, // Description
						'', // Empty quantity
						'', // Empty unit price
						'', // Empty total
					])
				}

				// Add GST breakdown if applicable
				if (data.pricing.gstEnabled && addOn.gstAmount > 0) {
					addOnRows.push([
						'', // Empty item
						`↳ Base: $${(addOn.total - addOn.gstAmount).toFixed(2)} + GST: $${addOn.gstAmount.toFixed(2)}`,
						'', // Empty quantity
						'', // Empty unit price
						'', // Empty total
					])
				}
			}

			const addOnColumnWidths = [100, 150, 60, 80, 80]
			builder.drawTable(addOnHeaders, addOnRows, addOnColumnWidths)
		}

		// Custom Services Table
		if (data.customServices.length > 0) {
			builder.drawSubheading('Custom Services')
			const serviceHeaders = ['Service', 'Description', 'Total']
			const serviceRows: string[][] = []

			for (const service of data.customServices) {
				serviceRows.push([service.name, service.description || 'Custom service', `$${service.total.toFixed(2)}`])

				// Add GST breakdown if applicable
				if (data.pricing.gstEnabled && service.gstAmount > 0) {
					serviceRows.push([
						'', // Empty service
						`↳ Base: $${(service.total - service.gstAmount).toFixed(2)} + GST: $${service.gstAmount.toFixed(2)}`,
						'', // Empty total
					])
				}
			}

			const serviceColumnWidths = [150, 200, 100]
			builder.drawTable(serviceHeaders, serviceRows, serviceColumnWidths)
		}
	}

	// Enhanced Pricing Summary Section
	builder.drawHeading('Pricing Summary')

	// Subtotal in accent color
	builder.drawKeyValueBox(
		'Subtotal',
		`$${(data.pricing.subtotalBeforeMarkupAndDiscount + data.pricing.totalMarkup).toFixed(2)}`,
		[0.9, 0.95, 1.0], // Light blue accent
	)

	// GST section
	if (data.pricing.gstEnabled && data.pricing.totalGST > 0) {
		builder.drawKeyValueBox(`Total GST (${data.pricing.gstRate}%)`, `$${data.pricing.totalGST.toFixed(2)}`)
	}

	// Discount section
	if (data.pricing.discountAmount > 0) {
		let discountLabel = ''
		if (data.pricing.discountType === 'percentage') {
			discountLabel = `Discount (${data.pricing.discountValue}%)`
		} else {
			discountLabel = `Discount ($${data.pricing.discountValue})`
		}

		if (data.pricing.discountReason) {
			discountLabel += ` - ${data.pricing.discountReason}`
		}

		builder.drawKeyValueBox(
			discountLabel,
			`-$${data.pricing.discountAmount.toFixed(2)}`,
			[1.0, 0.95, 0.7], // Warning yellow for discount
		)
	}

	// Final total in success color box (prominent)
	builder.drawKeyValueBox(
		'TOTAL',
		`$${data.pricing.grandTotal.toFixed(2)}`,
		[0.8, 0.95, 0.8], // Success green
	)

	// Professional footer with success message
	builder.drawInfoBox('Thank you for your business!', 'success')

	// Generation timestamp
	const timestamp = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
	builder.drawSmallText(timestamp)

	const pdfBytes = await doc.save()
	// @ts-ignore
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
