import { PDFDocument } from 'pdf-lib'
import { PDFBuilder } from '@/lib/pdf'
import type { SelfContainedQuoteData } from './types'

export async function generateQuotePDF(data: SelfContainedQuoteData): Promise<Blob> {
	const doc = await PDFDocument.create()
	const builder = new PDFBuilder(doc)

	await builder.loadFonts()

	// Enhanced Title with colored header box
	builder.drawTitle('CURTAINS & BLINDS QUOTATION')
	builder.drawKeyValueBox('Quote Date', data.quoteDate)
	builder.drawKeyValueBox('Quote ID', `#${data.id.slice(-8)}`)

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

	// Payment Terms
	if (data.paymentTerms) {
		builder.drawKeyValueBox('Payment Terms', data.paymentTerms)
	}

	// Product Breakdown Section with enhanced table layout
	builder.drawHeading('Product Breakdown')

	if (data.products.length === 0) {
		builder.drawInfoBox('No products with valid pricing in this quote.', 'warning')
	} else {
		// Create products table with enhanced matrix support
		const productHeaders = ['Product', 'Specifications', 'Qty', 'Unit Price', 'Total']
		const productRows: string[][] = []

		for (const product of data.products) {
			const sqm = product.width * product.height

			// Main product row with price type indication
			let specifications = ''
			let unitPriceDisplay = ''

			if (product.priceType === 'sqm') {
				specifications = `${product.width}m × ${product.height}m\n(${sqm.toFixed(2)} sqm)\nPer SQM`
				unitPriceDisplay = `$${product.effectivePrice.toFixed(2)}/sqm`
			} else if (product.priceType === 'matrix') {
				specifications = `${product.width}m × ${product.height}m\nMatrix Pricing\n(${sqm.toFixed(2)} sqm)`
				unitPriceDisplay = `$${product.effectivePrice.toFixed(2)}`
			} else {
				specifications = `Per Unit\n(Each)`
				unitPriceDisplay = `$${product.effectivePrice.toFixed(2)}/each`
			}

			productRows.push([
				product.label || product.name,
				specifications,
				product.quantity.toString(),
				unitPriceDisplay,
				`$${product.total.toFixed(2)}`,
			])

			// Product details row with enhanced information
			let details = []

			// Always show the actual product name if different from label
			if (product.label && product.label !== product.name) {
				details.push(`Product: ${product.name}`)
			}

			// Category information
			if (product.categoryName && product.categoryName !== 'Unknown Category') {
				details.push(`Category: ${product.categoryName}`)
			}

			// Product features
			if (product.color && product.color !== 'White') {
				details.push(`Color: ${product.color}`)
			}
			if (product.controlType && product.controlType !== 'Cord') {
				details.push(`Control: ${product.controlType}`)
			}
			if (product.installation) {
				details.push(`Installation: Included`)
			}

			if (details.length > 0) {
				productRows.push([
					'', // Empty product column
					`${details.join(' • ')}`, // Details span specifications column
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}

			// Special features in separate row
			if (product.specialFeatures) {
				productRows.push([
					'', // Empty product column
					`Special Features: ${product.specialFeatures}`,
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}

			// Pricing breakdown row for markup
			if (product.effectivePrice !== product.basePrice) {
				const markupAmount = product.effectivePrice - product.basePrice
				productRows.push([
					'', // Empty product column
					`Base Price: $${product.basePrice.toFixed(2)} + Markup: $${markupAmount.toFixed(2)}`,
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}

			// GST breakdown row if applicable
			if (data.pricing.gstEnabled && product.gstAmount > 0) {
				productRows.push([
					'', // Empty product column
					`Subtotal: $${(product.total - product.gstAmount).toFixed(2)} + GST (${data.pricing.gstRate}%): $${product.gstAmount.toFixed(2)}`,
					'', // Empty qty
					'', // Empty unit price
					'', // Empty total
				])
			}

			// Add spacing between products
			if (data.products.indexOf(product) < data.products.length - 1) {
				productRows.push(['', '', '', '', ''])
			}
		}

		// Draw products table with custom column widths optimized for matrix info
		const productColumnWidths = [120, 160, 40, 80, 80]
		builder.drawTable(productHeaders, productRows, productColumnWidths)
	}

	// Additional Items & Services Section
	const hasAdditionalItems = data.addOns.length > 0 || data.customServices.length > 0

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		// Add-ons Table
		if (data.addOns.length > 0) {
			builder.drawSubheading('Additional Items')
			const addOnHeaders = ['Item', 'Specifications', 'Quantity', 'Unit Price', 'Total']
			const addOnRows: string[][] = []

			for (const addOn of data.addOns) {
				let specifications = `Unit Type: ${addOn.unitType.toUpperCase()}`

				if (addOn.unitType === 'sqm' && addOn.width && addOn.height) {
					const addOnSqm = addOn.width * addOn.height
					specifications += `\n${addOn.width.toFixed(2)}m × ${addOn.height.toFixed(2)}m`
					specifications += `\n(${addOnSqm.toFixed(2)} sqm)`
				} else if (addOn.unitType === 'linear' && addOn.length) {
					specifications += `\nLength: ${addOn.length.toFixed(2)}m`
				}

				addOnRows.push([
					addOn.name,
					specifications,
					addOn.quantity.toString(),
					`$${addOn.unitPrice.toFixed(2)}/${addOn.unitType}`,
					`$${addOn.total.toFixed(2)}`,
				])

				// Add description row if available
				if (addOn.description) {
					addOnRows.push([
						'', // Empty item
						`Description: ${addOn.description}`, // Description
						'', // Empty quantity
						'', // Empty unit price
						'', // Empty total
					])
				}

				// Add GST breakdown if applicable
				if (data.pricing.gstEnabled && addOn.gstAmount > 0) {
					addOnRows.push([
						'', // Empty item
						`Subtotal: $${(addOn.total - addOn.gstAmount).toFixed(2)} + GST: $${addOn.gstAmount.toFixed(2)}`,
						'', // Empty quantity
						'', // Empty unit price
						'', // Empty total
					])
				}
			}

			const addOnColumnWidths = [100, 160, 50, 80, 80]
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
						`Subtotal: $${(service.total - service.gstAmount).toFixed(2)} + GST: $${service.gstAmount.toFixed(2)}`,
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

	// Show detailed breakdown
	builder.drawKeyValueBox(
		'Subtotal (Before Markup & Discount)',
		`$${data.pricing.subtotalBeforeMarkupAndDiscount.toFixed(2)}`,
	)

	// Markup section
	if (data.pricing.totalMarkup > 0) {
		builder.drawKeyValueBox(
			`Markup Applied`,
			`+$${data.pricing.totalMarkup.toFixed(2)}`,
			[0.95, 0.9, 1.0], // Light purple for markup
		)
	}

	// Subtotal after markup
	const subtotalAfterMarkup = data.pricing.subtotalBeforeMarkupAndDiscount + data.pricing.totalMarkup
	builder.drawKeyValueBox(
		'Subtotal (After Markup)',
		`$${subtotalAfterMarkup.toFixed(2)}`,
		[0.9, 0.95, 1.0], // Light blue accent
	)

	// GST section
	if (data.pricing.gstEnabled && data.pricing.totalGST > 0) {
		builder.drawKeyValueBox(
			`GST (${data.pricing.gstRate}%)`,
			`+$${data.pricing.totalGST.toFixed(2)}`,
			[0.95, 0.95, 0.9], // Light yellow for tax
		)
	}

	// Discount section
	if (data.pricing.discountAmount > 0) {
		let discountLabel = 'Discount'
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
			[1.0, 0.9, 0.9], // Light red for discount
		)
	}

	// Final total in success color box (prominent)
	builder.drawKeyValueBox(
		'GRAND TOTAL',
		`$${data.pricing.grandTotal.toFixed(2)}`,
		[0.8, 0.95, 0.8], // Success green
	)

	// Quote summary stats
	const productCount = data.products.length
	const addOnCount = data.addOns.length
	const serviceCount = data.customServices.length
	const totalItems = productCount + addOnCount + serviceCount

	if (totalItems > 0) {
		builder.drawInfoBox(
			`Quote Summary: ${productCount} product${productCount !== 1 ? 's' : ''}, ${addOnCount} add-on${addOnCount !== 1 ? 's' : ''}, ${serviceCount} custom service${serviceCount !== 1 ? 's' : ''}`,
			'info',
		)
	}

	// Professional footer with success message
	builder.drawInfoBox('Thank you for choosing our curtains and blinds services!', 'success')

	// Important notes
	if (data.pricing.gstEnabled) {
		builder.drawInfoBox('All prices are inclusive of GST where applicable.', 'info')
	}

	// Generation timestamp
	const timestamp = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
	builder.drawSmallText(timestamp)

	// Quote validity
	const validityDate = new Date()
	validityDate.setDate(validityDate.getDate() + 30) // 30 days validity
	builder.drawSmallText(`Quote valid until: ${validityDate.toLocaleDateString()}`)

	const pdfBytes = await doc.save()
	// @ts-ignore
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
