import { PDFBuilder } from '@/lib/pdf'
import { PDFDocument } from 'pdf-lib'
import type { QuotationData } from './types'

export async function generateTileQuotePDF(data: QuotationData): Promise<Blob> {
	const doc = await PDFDocument.create()
	const builder = new PDFBuilder(doc)

	await builder.loadFonts()

	// Enhanced Title with colored header box
	builder.drawTitle('TILE QUOTATION')
	builder.drawKeyValueBox('Quote Date', new Date().toLocaleDateString())

	// Customer Information Section with info box
	builder.drawHeading('Customer Information')

	// Customer details in structured key-value boxes
	builder.drawKeyValueBox('Name', data.customerInfo.name)
	builder.drawKeyValueBox('Email', data.customerInfo.email)
	builder.drawKeyValueBox('Phone', data.customerInfo.phone)
	builder.drawKeyValueBox('Customer Address', data.customerInfo.customerAddress)

	if (data.customerInfo.projectAddress) {
		builder.drawKeyValueBox('Project Address', data.customerInfo.projectAddress)
	}

	// Material Items Section with enhanced table layout
	builder.drawHeading('Material Selection')

	if (data.selections.materialItems.length === 0) {
		builder.drawInfoBox('No materials selected for this quote.', 'warning')
	} else {
		// Create materials table
		const materialHeaders = ['Item', 'Material', 'Sq Ft', 'Unit Price', 'Total']
		const materialRows: string[][] = []

		for (const item of data.selections.materialItems) {
			// Calculate item total and unit price
			let itemTotal = 0
			let unitPrice = 0
			let basePrice = 0
			let details = []

			if (item.material) {
				basePrice = item.material.basePrice
				let effectivePrice = basePrice

				// Apply style multiplier
				if (item.style) {
					effectivePrice *= item.style.multiplier
					details.push(`${item.style.name}`)
				}

				// Apply size multiplier
				if (item.size) {
					effectivePrice *= item.size.multiplier
					details.push(`${item.size.name}`)
				}

				// Apply finish premium
				if (item.finish) {
					effectivePrice += item.finish.premium
					details.push(`${item.finish.name}`)
				}

				unitPrice = effectivePrice
				itemTotal = effectivePrice * item.squareFootage
			}

			// Add main row to table
			materialRows.push([
				item.label,
				item.material?.name || 'N/A',
				item.squareFootage.toString(),
				`$${unitPrice.toFixed(2)}`,
				`$${itemTotal.toFixed(2)}`,
			])

			// Add details row if there are customizations
			if (details.length > 0) {
				materialRows.push([
					'', // Empty item column
					`- ${details.join(' • ')}`, // Details in material column
					'', // Empty sq ft
					basePrice > 0 ? `Base: $${basePrice.toFixed(2)}` : '', // Base price info
					'', // Empty total
				])
			}
		}

		// Draw materials table with custom column widths
		const materialColumnWidths = [120, 160, 60, 80, 80]
		builder.drawTable(materialHeaders, materialRows, materialColumnWidths)
	}

	// Custom Items and Services Section
	const hasAdditionalItems = data.addOns.customItems.length > 0 || data.addOns.customServices.length > 0

	if (hasAdditionalItems) {
		builder.drawHeading('Additional Items & Services')

		// Custom Items Table
		if (data.addOns.customItems.length > 0) {
			builder.drawSubheading('Custom Items')
			const itemHeaders = ['Item', 'Quantity', 'Unit Price', 'Total']
			const itemRows: string[][] = []

			for (const item of data.addOns.customItems) {
				const itemTotal = item.price * item.quantity
				let itemName = item.name

				if (item.measurement) {
					itemName += ` (${item.measurement} ${item.unit})`
				}

				itemRows.push([
					itemName,
					`${item.quantity} ${item.unit}`,
					`$${item.price.toFixed(2)}`,
					`$${itemTotal.toFixed(2)}`,
				])
			}

			const itemColumnWidths = [200, 80, 80, 80]
			builder.drawTable(itemHeaders, itemRows, itemColumnWidths)
		}

		// Custom Services Table
		if (data.addOns.customServices.length > 0) {
			builder.drawSubheading('Custom Services')
			const serviceHeaders = ['Service', 'Price']
			const serviceRows: string[][] = []

			for (const service of data.addOns.customServices) {
				serviceRows.push([service.name, `$${service.price.toFixed(2)}`])
			}

			const serviceColumnWidths = [350, 150]
			builder.drawTable(serviceHeaders, serviceRows, serviceColumnWidths)
		}
	}

	// Enhanced Pricing Summary Section
	builder.drawHeading('Pricing Summary')

	// Main pricing breakdown in structured boxes
	builder.drawKeyValueBox('Materials Cost', `$${(data.pricing.materialCost + data.pricing.markupAmount).toFixed(2)}`)

	if (data.pricing.customItemsCost > 0) {
		builder.drawKeyValueBox('Custom Items', `$${data.pricing.customItemsCost.toFixed(2)}`)
	}

	if (data.pricing.customServicesCost > 0) {
		builder.drawKeyValueBox('Custom Services', `$${data.pricing.customServicesCost.toFixed(2)}`)
	}

	// Subtotal in accent color
	builder.drawKeyValueBox('Subtotal', `$${data.pricing.subtotal.toFixed(2)}`, [0.9, 0.95, 1.0])

	// Discount section
	if (data.pricingOptions.discount.enabled && data.pricing.discountAmount > 0) {
		builder.drawKeyValueBox(
			`Discount (${data.pricingOptions.discount.value}%)`,
			`-$${data.pricing.discountAmount.toFixed(2)}`,
			[1.0, 0.95, 0.7], // Warning color for discount
		)

		builder.drawKeyValueBox('After Discount', `$${data.pricing.afterDiscount.toFixed(2)}`)
	}

	// GST section with breakdown
	if (data.pricingOptions.gst.enabled && data.pricing.gstAmount > 0) {
		builder.drawKeyValueBox(`GST (${data.pricingOptions.gst.percentage}%)`, `$${data.pricing.gstAmount.toFixed(2)}`)

		// GST Breakdown table if available
		const hasGSTBreakdown =
			data.pricing.breakdown.tileGST > 0 ||
			data.pricing.breakdown.customItemsGST > 0 ||
			data.pricing.breakdown.customServicesGST > 0

		if (hasGSTBreakdown) {
			const gstHeaders = ['GST Component', 'Amount']
			const gstRows: string[][] = []

			if (data.pricing.breakdown.tileGST > 0) {
				gstRows.push(['Tile GST', `$${data.pricing.breakdown.tileGST.toFixed(2)}`])
			}
			if (data.pricing.breakdown.customItemsGST > 0) {
				gstRows.push(['Custom Items GST', `$${data.pricing.breakdown.customItemsGST.toFixed(2)}`])
			}
			if (data.pricing.breakdown.customServicesGST > 0) {
				gstRows.push(['Custom Services GST', `$${data.pricing.breakdown.customServicesGST.toFixed(2)}`])
			}

			const gstColumnWidths = [250, 100]
			builder.drawTable(gstHeaders, gstRows, gstColumnWidths)
		}
	}

	// Final total in success color box (prominent)
	builder.drawKeyValueBox('TOTAL', `$${data.pricing.finalTotal.toFixed(2)}`, [0.8, 0.95, 0.8])

	// Professional footer with info boxes
	builder.drawInfoBox('Thank you for choosing us for your tiling project!', 'success')

	// Generation timestamp in small info box
	const timestamp = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
	builder.drawSmallText(timestamp)

	const pdfBytes = await doc.save()
	// @ts-ignore
	return new Blob([pdfBytes], { type: 'application/pdf' })
}
