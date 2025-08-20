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
	}
	lineHeight: number
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
		primary: [0.2, 0.2, 0.2],
		secondary: [0.4, 0.4, 0.4],
		text: [0.1, 0.1, 0.1],
		muted: [0.6, 0.6, 0.6],
	},
	lineHeight: 1.4,
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

		const rightTextWidth = this.fonts[font].widthOfTextAtSize(rightText, fontSize)
		const rightX = PDF_CONFIG.pageWidth - PDF_CONFIG.margin - rightTextWidth
		this.drawText(rightText, rightX, fontSize, color, font)

		this.currentY -= lineHeight
	}

	private addSpacing(multiplier = 1): void {
		this.currentY -= PDF_CONFIG.fontSize.body * PDF_CONFIG.lineHeight * multiplier
	}

	drawTitle(text: string): void {
		this.drawLine(text, PDF_CONFIG.fontSize.title, PDF_CONFIG.colors.primary, 'bold')
		this.addSpacing(0.5)
	}

	drawHeading(text: string): void {
		this.addSpacing(1.5)
		this.drawLine(text, PDF_CONFIG.fontSize.heading, PDF_CONFIG.colors.primary, 'bold')
		this.addSpacing(0.1)
	}

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
