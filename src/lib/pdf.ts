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
		primary: [0.2, 0.4, 0.8], // Blue
		secondary: [0.4, 0.4, 0.4], // Gray
		text: [0.1, 0.1, 0.1], // Dark gray
		muted: [0.6, 0.6, 0.6], // Light gray
		background: [0.95, 0.95, 0.95], // Light background
		accent: [0.9, 0.9, 1.0], // Light blue
		success: [0.8, 0.95, 0.8], // Light green
		warning: [1.0, 0.95, 0.7], // Light yellow
		error: [1.0, 0.9, 0.9], // Light red
		border: [0.7, 0.7, 0.7], // Border gray
		tableHeader: [0.3, 0.5, 0.9], // Header blue
		tableAlt: [0.97, 0.97, 0.97], // Alternate row color
	},
	lineHeight: 1.4,
	boxPadding: 12,
	borderRadius: 4,
	tableConfig: {
		borderWidth: 1,
		cellPadding: 8,
		headerHeight: 25,
		rowHeight: 20,
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

	// Enhanced methods with box styling
	drawTitle(text: string): void {
		const boxHeight = PDF_CONFIG.fontSize.title * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 2
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2

		this.checkPageSpace(boxHeight)

		// Draw title box
		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.title * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			PDF_CONFIG.colors.primary,
			PDF_CONFIG.colors.border,
		)

		// Draw title text
		this.drawText(
			text,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding,
			PDF_CONFIG.fontSize.title,
			[1, 1, 1], // White text
			'bold',
		)

		this.currentY -= boxHeight
	}

	drawHeading(text: string): void {
		this.addSpacing(1.5)
		const boxHeight = PDF_CONFIG.fontSize.heading * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 1.5
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2

		this.checkPageSpace(boxHeight)

		// Draw heading box
		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.heading * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			PDF_CONFIG.colors.accent,
			PDF_CONFIG.colors.border,
		)

		// Draw heading text
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

		const boxHeight = PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 2
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2

		this.checkPageSpace(boxHeight)

		// Draw info box
		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			colorMap[type],
			PDF_CONFIG.colors.border,
		)

		// Draw info text
		this.drawText(
			text,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			'regular',
		)

		this.currentY -= boxHeight
		this.addSpacing(0.5)
	}

	drawTable(headers: string[], rows: string[][], columnWidths?: number[]): void {
		const tableWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2
		const colCount = headers.length
		const defaultColWidth = tableWidth / colCount
		const colWidths = columnWidths || new Array(colCount).fill(defaultColWidth)

		// Calculate total table height
		const totalHeight =
			PDF_CONFIG.tableConfig.headerHeight +
			rows.length * PDF_CONFIG.tableConfig.rowHeight +
			(rows.length + 1) * PDF_CONFIG.tableConfig.borderWidth

		this.checkPageSpace(totalHeight)

		let currentX = PDF_CONFIG.margin
		let tableY = this.currentY

		// Draw header row
		for (let i = 0; i < headers.length; i++) {
			// Header background
			this.drawRectangle(
				currentX,
				tableY - PDF_CONFIG.tableConfig.headerHeight,
				colWidths[i],
				PDF_CONFIG.tableConfig.headerHeight,
				PDF_CONFIG.colors.tableHeader,
				PDF_CONFIG.colors.border,
				PDF_CONFIG.tableConfig.borderWidth,
			)

			// Header text
			this.drawText(
				headers[i],
				currentX + PDF_CONFIG.tableConfig.cellPadding,
				tableY - PDF_CONFIG.tableConfig.headerHeight + PDF_CONFIG.tableConfig.cellPadding,
				PDF_CONFIG.fontSize.body,
				[1, 1, 1], // White text
				'bold',
			)

			currentX += colWidths[i]
		}

		tableY -= PDF_CONFIG.tableConfig.headerHeight

		// Draw data rows
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			currentX = PDF_CONFIG.margin
			const isAlternate = rowIndex % 2 === 1

			for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
				// Cell background
				this.drawRectangle(
					currentX,
					tableY - PDF_CONFIG.tableConfig.rowHeight,
					colWidths[colIndex],
					PDF_CONFIG.tableConfig.rowHeight,
					isAlternate ? PDF_CONFIG.colors.tableAlt : [1, 1, 1],
					PDF_CONFIG.colors.border,
					PDF_CONFIG.tableConfig.borderWidth,
				)

				// Cell text
				this.drawText(
					rows[rowIndex][colIndex] || '',
					currentX + PDF_CONFIG.tableConfig.cellPadding,
					tableY - PDF_CONFIG.tableConfig.rowHeight + PDF_CONFIG.tableConfig.cellPadding,
					PDF_CONFIG.fontSize.body,
					PDF_CONFIG.colors.text,
					'regular',
				)

				currentX += colWidths[colIndex]
			}

			tableY -= PDF_CONFIG.tableConfig.rowHeight
		}

		this.currentY = tableY
		this.addSpacing(1)
	}

	drawKeyValueBox(key: string, value: string, color?: [number, number, number]): void {
		const boxHeight = PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight + PDF_CONFIG.boxPadding * 2
		const boxWidth = PDF_CONFIG.pageWidth - PDF_CONFIG.margin * 2
		const bgColor = color || PDF_CONFIG.colors.background

		this.checkPageSpace(boxHeight)

		// Draw key-value box
		this.drawRectangle(
			PDF_CONFIG.margin,
			this.currentY - boxHeight + PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight,
			boxWidth,
			boxHeight,
			bgColor,
			PDF_CONFIG.colors.border,
		)

		// Draw key (bold, left side)
		this.drawText(
			key,
			PDF_CONFIG.margin + PDF_CONFIG.boxPadding,
			this.currentY - PDF_CONFIG.boxPadding,
			PDF_CONFIG.fontSize.body,
			PDF_CONFIG.colors.text,
			'bold',
		)

		// Draw value (regular, right side)
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
