import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export function openPdf(blob: Blob) {
	const url = URL.createObjectURL(blob)
	window.open(url)
}

export interface PDFConfig {
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
		background: [number, number, number]
		accent: [number, number, number]
		success: [number, number, number]
		warning: [number, number, number]
		error: [number, number, number]
		border: [number, number, number]
		tableHeader: [number, number, number]
		tableAlt: [number, number, number]
	}
	lineHeight: number
	boxPadding: number
	borderRadius: number
	tableConfig: {
		borderWidth: number
		cellPadding: number
		headerHeight: number
		rowHeight: number
		minRowHeight: number // Add minimum row height
	}
}

export const PDF_CONFIG: PDFConfig = {
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
		primary: [0.2, 0.4, 0.8],
		secondary: [0.4, 0.4, 0.4],
		text: [0.1, 0.1, 0.1],
		muted: [0.6, 0.6, 0.6],
		background: [0.95, 0.95, 0.95],
		accent: [0.9, 0.9, 1.0],
		success: [0.8, 0.95, 0.8],
		warning: [1.0, 0.95, 0.7],
		error: [1.0, 0.9, 0.9],
		border: [0.7, 0.7, 0.7],
		tableHeader: [0.3, 0.5, 0.9],
		tableAlt: [0.97, 0.97, 0.97],
	},
	lineHeight: 1.4,
	boxPadding: 12,
	borderRadius: 4,
	tableConfig: {
		borderWidth: 1,
		cellPadding: 8,
		headerHeight: 25,
		rowHeight: 20,
		minRowHeight: 15,
	},
}

export class PDFBuilder {
	private doc: PDFDocument
	private currentPage: any
	private currentY: number
	private fonts: { [key: string]: any } = {}

	constructor(doc: PDFDocument) {
		this.doc = doc
		this.currentPage = doc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight])
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
		this.currentPage = this.doc.addPage([PDF_CONFIG.pageWidth, PDF_CONFIG.pageHeight])
		this.currentY = PDF_CONFIG.pageHeight - PDF_CONFIG.margin
	}

	private drawRectangle(
		x: number,
		y: number,
		width: number,
		height: number,
		fillColor?: [number, number, number],
		borderColor?: [number, number, number],
		borderWidth = 1,
	): void {
		if (fillColor) {
			this.currentPage.drawRectangle({
				x,
				y,
				width,
				height,
				color: rgb(...fillColor),
			})
		}

		if (borderColor) {
			this.currentPage.drawRectangle({
				x,
				y,
				width,
				height,
				borderColor: rgb(...borderColor),
				borderWidth,
			})
		}
	}

	private drawText(
		text: string,
		x: number,
		y: number,
		fontSize: number,
		color: [number, number, number] = PDF_CONFIG.colors.text,
		font: 'regular' | 'bold' = 'regular',
	): void {
		this.currentPage.drawText(text, {
			x,
			y,
			size: fontSize,
			font: this.fonts[font],
			color: rgb(...color),
		})
	}

	// Enhanced text wrapping method
	private wrapText(text: string, maxWidth: number, fontSize: number, font: 'regular' | 'bold' = 'regular'): string[] {
		// First split by existing line breaks
		const paragraphs = text.split('\n')
		const allLines: string[] = []

		for (const paragraph of paragraphs) {
			if (paragraph.trim() === '') {
				allLines.push('') // Keep empty lines
				continue
			}

			const words = paragraph.split(' ')
			let currentLine = ''

			for (const word of words) {
				const testLine = currentLine ? `${currentLine} ${word}` : word
				// Remove any remaining newlines from individual words
				const cleanTestLine = testLine.replace(/\n/g, ' ')
				const testWidth = this.fonts[font].widthOfTextAtSize(cleanTestLine, fontSize)

				if (testWidth <= maxWidth) {
					currentLine = testLine
				} else {
					if (currentLine) {
						allLines.push(currentLine)
						currentLine = word
					} else {
						// Word is too long, break it
						allLines.push(word)
					}
				}
			}

			if (currentLine) {
				allLines.push(currentLine)
			}
		}

		return allLines
	}
	// Enhanced method to calculate text height
	private calculateTextHeight(
		text: string,
		maxWidth: number,
		fontSize: number,
		font: 'regular' | 'bold' = 'regular',
	): number {
		const lines = this.wrapText(text, maxWidth, fontSize, font)
		return lines.length * fontSize * PDF_CONFIG.lineHeight
	}

	// Enhanced method to draw wrapped text
	private drawWrappedText(
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		fontSize: number,
		color: [number, number, number] = PDF_CONFIG.colors.text,
		font: 'regular' | 'bold' = 'regular',
		align: 'left' | 'center' | 'right' = 'left',
	): number {
		const lines = this.wrapText(text, maxWidth, fontSize, font)
		let currentY = y

		for (const line of lines) {
			// Clean the line of any remaining newlines before drawing
			const cleanLine = line.replace(/\n/g, ' ')
			let drawX = x

			if (cleanLine.trim() !== '') {
				// Only process non-empty lines
				if (align === 'center') {
					const lineWidth = this.fonts[font].widthOfTextAtSize(cleanLine, fontSize)
					drawX = x + (maxWidth - lineWidth) / 2
				} else if (align === 'right') {
					const lineWidth = this.fonts[font].widthOfTextAtSize(cleanLine, fontSize)
					drawX = x + maxWidth - lineWidth
				}

				this.drawText(cleanLine, drawX, currentY, fontSize, color, font)
			}
			currentY -= fontSize * PDF_CONFIG.lineHeight
		}

		return currentY
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
		this.drawText(text, PDF_CONFIG.margin + indent, this.currentY, fontSize, color, font)
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

		this.drawText(leftText, PDF_CONFIG.margin, this.currentY, fontSize, color, font)

		const rightTextWidth = this.fonts[font].widthOfTextAtSize(rightText, fontSize)
		const rightX = PDF_CONFIG.pageWidth - PDF_CONFIG.margin - rightTextWidth
		this.drawText(rightText, rightX, this.currentY, fontSize, color, font)

		this.currentY -= lineHeight
	}

	private addSpacing(multiplier = 1): void {
		this.currentY -= PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight * multiplier
	}

	// Enhanced table drawing with text wrapping
	drawTable(headers: string[], rows: string[][], columnWidths?: number[]): void {
		const tableWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2
		const colCount = headers.length
		const defaultColWidth = tableWidth / colCount
		const colWidths = columnWidths || new Array(colCount).fill(defaultColWidth)

		// Calculate row heights based on content
		const rowHeights: number[] = []

		// Header height
		const headerHeight = PDF_CONFIG.tableConfig.headerHeight

		// Calculate height for each row
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			let maxRowHeight = PDF_CONFIG.tableConfig.minRowHeight

			for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
				const cellText = rows[rowIndex][colIndex] || ''
				if (cellText.trim() === '') continue // Skip empty cells

				const maxTextWidth = colWidths[colIndex] - PDF_CONFIG.tableConfig.cellPadding * 2
				const textHeight = this.calculateTextHeight(cellText, maxTextWidth, PDF_CONFIG.fontSize.body)
				const requiredHeight = textHeight + PDF_CONFIG.tableConfig.cellPadding * 2

				maxRowHeight = Math.max(maxRowHeight, requiredHeight)
			}

			rowHeights.push(maxRowHeight)
		}

		// Calculate total table height
		const totalHeight =
			headerHeight +
			rowHeights.reduce((sum, height) => sum + height, 0) +
			(rowHeights.length + 1) * PDF_CONFIG.tableConfig.borderWidth

		this.checkPageSpace(totalHeight)

		let currentX = PDF_CONFIG.margin
		let tableY = this.currentY

		// Draw header row
		for (let i = 0; i < headers.length; i++) {
			// Header background
			this.drawRectangle(
				currentX,
				tableY - headerHeight,
				colWidths[i],
				headerHeight,
				PDF_CONFIG.colors.tableHeader,
				PDF_CONFIG.colors.border,
				PDF_CONFIG.tableConfig.borderWidth,
			)

			// Header text (centered)
			const maxTextWidth = colWidths[i] - PDF_CONFIG.tableConfig.cellPadding * 2
			this.drawWrappedText(
				headers[i],
				currentX + PDF_CONFIG.tableConfig.cellPadding,
				tableY - PDF_CONFIG.tableConfig.cellPadding - PDF_CONFIG.fontSize.body,
				maxTextWidth,
				PDF_CONFIG.fontSize.body,
				[1, 1, 1], // White text
				'bold',
				'center',
			)

			currentX += colWidths[i]
		}

		tableY -= headerHeight

		// Draw data rows
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			currentX = PDF_CONFIG.margin
			const isAlternate = rowIndex % 2 === 1
			const rowHeight = rowHeights[rowIndex]

			for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
				// Cell background
				this.drawRectangle(
					currentX,
					tableY - rowHeight,
					colWidths[colIndex],
					rowHeight,
					isAlternate ? PDF_CONFIG.colors.tableAlt : [1, 1, 1],
					PDF_CONFIG.colors.border,
					PDF_CONFIG.tableConfig.borderWidth,
				)

				// Cell text with wrapping
				const cellText = rows[rowIndex][colIndex] || ''
				if (cellText.trim() !== '') {
					const maxTextWidth = colWidths[colIndex] - PDF_CONFIG.tableConfig.cellPadding * 2
					this.drawWrappedText(
						cellText,
						currentX + PDF_CONFIG.tableConfig.cellPadding,
						tableY - PDF_CONFIG.tableConfig.cellPadding - PDF_CONFIG.fontSize.body,
						maxTextWidth,
						PDF_CONFIG.fontSize.body,
						PDF_CONFIG.colors.text,
						'regular',
						colIndex === headers.length - 1 ? 'right' : 'left', // Right align last column (usually totals)
					)
				}

				currentX += colWidths[colIndex]
			}

			tableY -= rowHeight
		}

		this.currentY = tableY
		this.addSpacing(1)
	}

	// Enhanced table method with better product layout
	drawProductTable(headers: string[], products: any[]): void {
		// const tableWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2
		const columnWidths = [120, 200, 40, 80, 80] // Increased specifications column

		for (let productIndex = 0; productIndex < products.length; productIndex++) {
			const product = products[productIndex]

			// Create main product row
			const mainRow = [
				product.label || product.name,
				this.formatProductSpecs(product),
				product.quantity.toString(),
				this.formatUnitPrice(product),
				`$${product.total.toFixed(2)}`,
			]

			// Draw main product row
			this.drawTable(headers, [mainRow], columnWidths)

			// Create detail rows if needed
			const detailRows = this.createProductDetailRows(product)
			if (detailRows.length > 0) {
				this.drawTable([], detailRows, columnWidths)
			}

			// Add spacing between products
			if (productIndex < products.length - 1) {
				this.addSpacing(0.5)
			}
		}
	}

	private formatProductSpecs(product: any): string {
		let specs = []

		if (product.priceType === 'sqm') {
			const sqm = product.width * product.height
			specs.push(`${product.width}m × ${product.height}m`)
			specs.push(`(${sqm.toFixed(2)} sqm)`)
			specs.push('Per SQM')
		} else if (product.priceType === 'matrix') {
			const sqm = product.width * product.height
			specs.push(`${product.width}m × ${product.height}m`)
			specs.push('Matrix Pricing')
			specs.push(`(${sqm.toFixed(2)} sqm)`)
		} else if (product.priceType === 'linear_meter') {
			specs.push(`Linear: ${product.width}m`)
			specs.push('Per Linear Meter')
		} else {
			specs.push('Per Unit (Each)')
		}

		return specs.join('\n')
	}

	private formatUnitPrice(product: any): string {
		if (product.priceType === 'sqm') {
			return `$${product.effectivePrice.toFixed(2)}/sqm`
		} else if (product.priceType === 'linear_meter') {
			return `$${product.effectivePrice.toFixed(2)}/m`
		} else {
			return `$${product.effectivePrice.toFixed(2)}/each`
		}
	}

	private createProductDetailRows(product: any): string[][] {
		const detailRows: string[][] = []

		// Product details
		let details = []
		if (product.label && product.label !== product.name) {
			details.push(`Product: ${product.name}`)
		}
		if (product.categoryName && product.categoryName !== 'Unknown Category') {
			details.push(`Category: ${product.categoryName}`)
		}
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
			detailRows.push(['', details.join(' • '), '', '', ''])
		}

		// Special features
		if (product.specialFeatures) {
			detailRows.push(['', `Special Features: ${product.specialFeatures}`, '', '', ''])
		}

		// Pricing breakdown
		if (product.effectivePrice !== product.basePrice) {
			const markupAmount = product.effectivePrice - product.basePrice
			detailRows.push([
				'',
				`Base Price: $${product.basePrice.toFixed(2)} + Markup: $${markupAmount.toFixed(2)}`,
				'',
				'',
				'',
			])
		}

		return detailRows
	}

	// Keep all existing methods for backward compatibility
	drawTitle(text: string): void {
		const boxHeight = PDF_CONFIG.fontSize.title * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 2
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2

		this.checkPageSpace(boxHeight)

		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.title * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			PDF_CONFIG.colors.primary,
			PDF_CONFIG.colors.border,
		)

		this.drawText(
			text,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding,
			PDF_CONFIG.fontSize.title,
			[1, 1, 1],
			'bold',
		)

		this.currentY -= boxHeight
	}

	drawHeading(text: string): void {
		this.addSpacing(1.5)
		const boxHeight = PDF_CONFIG.fontSize.heading * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 1.5
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2

		this.checkPageSpace(boxHeight)

		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.heading * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			PDF_CONFIG.colors.accent,
			PDF_CONFIG.colors.border,
		)

		this.drawText(
			text,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding * 0.75,
			PDF_CONFIG.fontSize.heading,
			PDF_CONFIG.colors.primary,
			'bold',
		)

		this.currentY -= boxHeight
	}

	drawInfoBox(text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
		const colorMap = {
			success: PDF_CONFIG.colors.success,
			warning: PDF_CONFIG.colors.warning,
			error: PDF_CONFIG.colors.error,
			info: PDF_CONFIG.colors.accent,
		}

		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2
		const maxTextWidth = boxWidth - PDF_CONFIG.boxPadding * 2
		const textHeight = this.calculateTextHeight(text, maxTextWidth, PDF_CONFIG.fontSize.body)
		const boxHeight = textHeight + PDF_CONFIG.boxPadding * 2

		this.checkPageSpace(boxHeight)

		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + textHeight,
			boxWidth,
			boxHeight,
			colorMap[type],
			PDF_CONFIG.colors.border,
		)

		this.drawWrappedText(
			text,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding,
			maxTextWidth,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			'regular',
		)

		this.currentY -= boxHeight
		this.addSpacing(0.5)
	}

	drawKeyValueBox(key: string, value: string, color?: [number, number, number]): void {
		const boxHeight = PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 2
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2
		const bgColor = color || PDF_CONFIG.colors.background

		this.checkPageSpace(boxHeight)

		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			bgColor,
			PDF_CONFIG.colors.border,
		)

		this.drawText(
			key,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			'bold',
		)

		const valueWidth = this.fonts.regular.widthOfTextAtSize(value, PDF_CONFIG.fontSize.body)
		this.drawText(
			value,
			PDF_CONFIG.pageWidth - PDF_CONFIG.margin - PDF_CONFIG.boxPadding - valueWidth,
			this.currentY - PDF_CONFIG.boxPadding,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			'regular',
		)

		this.currentY -= boxHeight
		this.addSpacing(0.2)
	}

	// Keep original methods for backward compatibility
	drawSubheading(text: string): void {
		this.addSpacing(0.3)
		this.drawLine(text, PDF_CONFIG.fontSize.subheading, PDF_CONFIG.colors.secondary, 'bold')
		this.addSpacing(0.2)
	}

	drawBodyText(text: string, indent: number = 0): void {
		this.drawLine(text, PDF_CONFIG.fontSize.body, PDF_CONFIG.colors.text, 'regular', indent)
	}

	drawBoldText(text: string, indent: number = 0) {
		this.drawLine(text, PDF_CONFIG.fontSize.body, PDF_CONFIG.colors.text, 'bold', indent)
	}

	drawDescriptionText(text: string, indent = -1): void {
		this.drawLine(text, PDF_CONFIG.fontSize.small, PDF_CONFIG.colors.text, 'regular', indent)
	}

	drawSmallText(text: string, indent = 0): void {
		this.drawLine(text, PDF_CONFIG.fontSize.small, PDF_CONFIG.colors.muted, 'regular', indent)
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
		this.drawTwoColumnLine(leftText, rightText, PDF_CONFIG.fontSize.small, PDF_CONFIG.colors.muted, 'regular')
	}
}
