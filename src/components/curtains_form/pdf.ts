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
		// Create products table with enhanced wrapping support
		const productHeaders = ['Product', 'Specifications', 'Qty', 'Unit Price', 'Total']
		const productRows: string[][] = []

		for (const product of data.products) {
			const sqm = product.width * product.height

			// Main product row with simplified specifications
			let specifications = ''
			let unitPriceDisplay = ''

			if (product.priceType === 'sqm') {
				specifications = `${product.width}m × ${product.height}m\n(${sqm.toFixed(2)} sqm)\nPer SQM`
				unitPriceDisplay = `$${product.effectivePrice.toFixed(2)}/sqm`
			} else if (product.priceType === 'matrix') {
				specifications = `${product.width}m × ${product.height}m\nMatrix Pricing\n(${sqm.toFixed(2)} sqm)`
				unitPriceDisplay = `$${product.effectivePrice.toFixed(2)}`
			} else if (product.priceType === 'linear_meter') {
				specifications = `Linear: ${product.width}m\nPer Linear Meter`
				unitPriceDisplay = `$${product.effectivePrice.toFixed(2)}/m`
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

			// Product details in a more organized way
			const details = []

			// Product information
			if (product.label && product.label !== product.name) {
				details.push(`Product: ${product.name}`)
			}
			if (product.categoryName && product.categoryName !== 'Unknown Category') {
				details.push(`Category: ${product.categoryName}`)
			}

			// Features and options
			const features = []
			if (product.color && product.color !== 'White') {
				features.push(`Color: ${product.color}`)
			}
			if (product.controlType && product.controlType !== 'Cord') {
				features.push(`Control: ${product.controlType}`)
			}
			if (product.installation) {
				features.push(`Installation: Included`)
			}

			if (features.length > 0) {
				details.push(features.join(' • '))
			}

			// Add details row if there are any details
			if (details.length > 0) {
				productRows.push([
					'', // Empty product column
					details.join('\n'), // Details in specifications column
					'',
					'',
					'', // Empty other columns
				])
			}

			// Special features in separate row
			if (product.specialFeatures) {
				productRows.push(['', `Special Features:\n${product.specialFeatures}`, '', '', ''])
			}

			// Pricing breakdown
			if (product.effectivePrice !== product.basePrice) {
				const markupAmount = product.effectivePrice - product.basePrice
				productRows.push([
					'',
					`Pricing:\nBase: $${product.basePrice.toFixed(2)}\nMarkup: $${markupAmount.toFixed(2)}`,
					'',
					'',
					'',
				])
			}

			// GST breakdown if applicable
			if (data.pricing.gstEnabled && product.gstAmount > 0) {
				productRows.push([
					'',
					`Tax Breakdown:\nSubtotal: $${(product.total - product.gstAmount).toFixed(2)}\nGST (${data.pricing.gstRate}%): $${product.gstAmount.toFixed(2)}`,
					'',
					'',
					'',
				])
			}

			// Add spacing between products
			if (data.products.indexOf(product) < data.products.length - 1) {
				productRows.push(['', '', '', '', ''])
			}
		}

		// Draw products table with optimized column widths for better text display
		const productColumnWidths = [100, 180, 35, 90, 90] // Adjusted for better content distribution
		builder.drawTable(productHeaders, productRows, productColumnWidths)
	}

	// Additional Items & Services Section
	const hasAdditionalItems = data.addOns.length > 0 || data.customServices.length > 0

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		// Add-ons Table with enhanced text wrapping
		if (data.addOns.length > 0) {
			builder.drawSubheading('Additional Items')
			const addOnHeaders = ['Item', 'Specifications', 'Qty', 'Unit Price', 'Total']
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
					`${addOn.unitPrice.toFixed(2)}/${addOn.unitType}`,
					`${addOn.total.toFixed(2)}`,
				])

				// Add description row if available
				if (addOn.description) {
					addOnRows.push([
						'', // Empty item
						`Description:\n${addOn.description}`, // Description with proper wrapping
						'',
						'',
						'', // Empty other columns
					])
				}

				// Add GST breakdown if applicable
				if (data.pricing.gstEnabled && addOn.gstAmount > 0) {
					addOnRows.push([
						'',
						`Tax Breakdown:\nSubtotal: ${(addOn.total - addOn.gstAmount).toFixed(2)}\nGST: ${addOn.gstAmount.toFixed(2)}`,
						'',
						'',
						'',
					])
				}
			}

			const addOnColumnWidths = [90, 170, 35, 90, 90]
			builder.drawTable(addOnHeaders, addOnRows, addOnColumnWidths)
		}

		// Custom Services Table with enhanced layout
		if (data.customServices.length > 0) {
			builder.drawSubheading('Custom Services')
			const serviceHeaders = ['Service', 'Description', 'Total']
			const serviceRows: string[][] = []

			for (const service of data.customServices) {
				serviceRows.push([service.name, service.description || 'Custom service', `${service.total.toFixed(2)}`])

				// Add GST breakdown if applicable
				if (data.pricing.gstEnabled && service.gstAmount > 0) {
					serviceRows.push([
						'',
						`Tax Breakdown:\nSubtotal: ${(service.total - service.gstAmount).toFixed(2)}\nGST: ${service.gstAmount.toFixed(2)}`,
						'',
					])
				}
			}

			const serviceColumnWidths = [120, 230, 100]
			builder.drawTable(serviceHeaders, serviceRows, serviceColumnWidths)
		}
	}

	// Enhanced Pricing Summary Section
	builder.drawHeading('Pricing Summary')

	const subtotalAfterMarkup = data.pricing.subtotalBeforeMarkupAndDiscount + data.pricing.totalMarkup

	builder.drawKeyValueBox(
		'Subtotal',
		`${subtotalAfterMarkup.toFixed(2)}`,
		[0.9, 0.95, 1.0], // Light blue accent
	)

	// GST section
	if (data.pricing.gstEnabled && data.pricing.totalGST > 0) {
		builder.drawKeyValueBox(
			`GST (${data.pricing.gstRate}%)`,
			`+${data.pricing.totalGST.toFixed(2)}`,
			[0.95, 0.95, 0.9], // Light yellow for tax
		)
	}

	// Discount section
	if (data.pricing.discountAmount > 0) {
		let discountLabel = 'Discount'
		if (data.pricing.discountType === 'percentage') {
			discountLabel = `Discount (${data.pricing.discountValue}%)`
		} else {
			discountLabel = `Discount (${data.pricing.discountValue})`
		}

		if (data.pricing.discountReason) {
			discountLabel += ` - ${data.pricing.discountReason}`
		}

		builder.drawKeyValueBox(
			discountLabel,
			`-${data.pricing.discountAmount.toFixed(2)}`,
			[1.0, 0.9, 0.9], // Light red for discount
		)
	}

	// Final total in success color box (prominent)
	builder.drawKeyValueBox(
		'GRAND TOTAL',
		`${data.pricing.grandTotal.toFixed(2)}`,
		[0.8, 0.95, 0.8], // Success green
	)

	// Quote summary stats
	const productCount = data.products.length
	const addOnCount = data.addOns.length
	const serviceCount = data.customServices.length
	const totalItems = productCount + addOnCount + serviceCount

	if (totalItems > 0) {
		const summaryText = `Quote Summary: ${productCount} product${productCount !== 1 ? 's' : ''}, ${addOnCount} add-on${addOnCount !== 1 ? 's' : ''}, ${serviceCount} custom service${serviceCount !== 1 ? 's' : ''}`
		builder.drawInfoBox(summaryText, 'info')
	}

	// Professional footer with success message
	builder.drawInfoBox(
		'Thank you for choosing our curtains and blinds services! We look forward to working with you.',
		'success',
	)

	// Important notes
	if (data.pricing.gstEnabled) {
		builder.drawInfoBox(
			'All prices are inclusive of GST where applicable. GST will be itemized on your final invoice.',
			'info',
		)
	}

	// Terms and conditions note
	builder.drawInfoBox(
		'This quote is subject to our standard terms and conditions. Final measurements will be taken before installation.',
		'info',
	)

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
