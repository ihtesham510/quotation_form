import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type {
  TilePricingBreakdown as PricingBreakdown,
  TileFormData as FormData,
} from '@/lib/types'

interface QuotationParams {
  title: string
  description: string
  formData: FormData
  pricingBreakdown: PricingBreakdown
}

export function openPdf(blob: Blob) {
  const url = URL.createObjectURL(blob)
  window.open(url)
}

export async function generateTilePdf({
  title,
  description,
  formData,
  pricingBreakdown,
}: QuotationParams): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()

  // Load fonts
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Define colors (shadcn light theme inspired)
  const colors = {
    primary: rgb(0.09, 0.09, 0.11), // zinc-900
    secondary: rgb(0.39, 0.39, 0.42), // zinc-600
    muted: rgb(0.96, 0.96, 0.97), // zinc-50
    border: rgb(0.9, 0.9, 0.91), // zinc-200
    accent: rgb(0.96, 0.98, 1), // blue-50
    text: rgb(0.02, 0.02, 0.02), // almost black
    success: rgb(0.05, 0.46, 0.05), // green-700
  }

  let page = pdfDoc.addPage([612, 792]) // Letter size
  const { width, height } = page.getSize()
  const margin = 50
  let yPosition = height - margin

  // Helper function to add new page if needed
  const checkAndAddPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin) {
      page = pdfDoc.addPage([612, 792])
      yPosition = height - margin
      return true
    }
    return false
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  // Title
  page.drawText(title, {
    x: margin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: colors.primary,
  })
  yPosition -= 40

  // Description
  if (description) {
    const descriptionLines = description.match(/.{1,80}(\s|$)/g) || [
      description,
    ]
    descriptionLines.forEach((line) => {
      page.drawText(line.trim(), {
        x: margin,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: colors.secondary,
      })
      yPosition -= 18
    })
    yPosition -= 10
  }

  // Date
  const currentDate = new Date().toLocaleDateString()
  page.drawText(`Date: ${currentDate}`, {
    x: width - margin - 120,
    y: height - margin - 60,
    size: 10,
    font: regularFont,
    color: colors.secondary,
  })

  // Section helper function
  const drawSection = (
    title: string,
    items: Array<{ label: string; value: string }>,
  ) => {
    checkAndAddPage(80)

    // Section header
    page.drawRectangle({
      x: margin,
      y: yPosition - 5,
      width: width - 2 * margin,
      height: 25,
      color: colors.muted,
    })

    page.drawText(title, {
      x: margin + 10,
      y: yPosition + 5,
      size: 14,
      font: boldFont,
      color: colors.primary,
    })
    yPosition -= 35

    // Section items
    items.forEach((item) => {
      checkAndAddPage(20)
      page.drawText(item.label, {
        x: margin + 20,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: colors.text,
      })

      page.drawText(item.value, {
        x: margin + 280,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: colors.text,
      })
      yPosition -= 16
    })
    yPosition -= 10
  }

  // Tile Specifications
  drawSection('Tile Specifications', [
    { label: 'Material:', value: formData.tileMaterial },
    { label: 'Style:', value: formData.tileStyle },
    { label: 'Size:', value: formData.tileSize },
    { label: 'Finish Type:', value: formData.finishType },
    { label: 'Application Area:', value: formData.applicationArea },
    {
      label: 'Square Footage:',
      value: formData.squareFootage.toString() + ' sq ft',
    },
  ])

  // Trim Pieces & Accessories
  const accessoryItems: Array<{ label: string; value: string }> = []

  if (formData.trimPieces.length > 0) {
    formData.trimPieces.forEach((trim) => {
      accessoryItems.push({
        label: `${trim.type} (Trim):`,
        value: `Qty: ${trim.quantity} - ${formatCurrency(trim.price)}`,
      })
    })
  }

  if (formData.transitionStrips.length > 0) {
    formData.transitionStrips.forEach((strip) => {
      accessoryItems.push({
        label: `${strip.type} (Transition):`,
        value: `Qty: ${strip.quantity} - ${formatCurrency(strip.price)}`,
      })
    })
  }

  if (formData.underlayment) {
    accessoryItems.push({
      label: `${formData.underlayment.type} (Underlayment):`,
      value: formatCurrency(formData.underlayment.price),
    })
  }

  if (formData.groutSealers.length > 0) {
    formData.groutSealers.forEach((sealer) => {
      accessoryItems.push({
        label: `${sealer.type} (Grout Sealer):`,
        value: formatCurrency(sealer.price),
      })
    })
  }

  if (accessoryItems.length > 0) {
    drawSection('Trim Pieces & Accessories', accessoryItems)
  }

  // Other Items
  if (formData.otherItems.length > 0) {
    const otherItemsList = formData.otherItems.map((item) => ({
      label: `${item.name}:`,
      value: `${item.quantity} ${item.unit} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)}`,
    }))
    drawSection('Additional Items', otherItemsList)
  }

  // Installation & Delivery
  const installationItems: Array<{ label: string; value: string }> = [
    { label: 'Delivery Option:', value: formData.deliveryOption },
  ]

  if (formData.installationComplexity.length > 0) {
    installationItems.push({
      label: 'Installation Complexity:',
      value: formData.installationComplexity.join(', '),
    })
  }

  if (formData.permitFees > 0) {
    installationItems.push({
      label: 'Permit Fees:',
      value: formatCurrency(formData.permitFees),
    })
  }

  if (formData.rushOrder) {
    installationItems.push({ label: 'Rush Order:', value: 'Yes' })
  }

  if (formData.weekendWork) {
    installationItems.push({ label: 'Weekend Work:', value: 'Yes' })
  }

  drawSection('Installation & Delivery', installationItems)

  // Pricing Breakdown
  checkAndAddPage(250)

  // Pricing header
  page.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: width - 2 * margin,
    height: 25,
    color: colors.accent,
  })

  page.drawText('Pricing Breakdown', {
    x: margin + 10,
    y: yPosition + 5,
    size: 16,
    font: boldFont,
    color: colors.primary,
  })
  yPosition -= 45

  // Pricing items
  const pricingItems = [
    { label: 'Material Cost:', amount: pricingBreakdown.materialCost },
    { label: 'Installation Cost:', amount: pricingBreakdown.installationCost },
    { label: 'Add-ons Subtotal:', amount: pricingBreakdown.addOnsSubtotal },
    {
      label: 'Other Items Subtotal:',
      amount: pricingBreakdown.otherItemsSubtotal,
    },
    {
      label: 'Additional Charges:',
      amount: pricingBreakdown.additionalChargesSubtotal,
    },
  ]

  pricingItems.forEach((item) => {
    checkAndAddPage(20)
    page.drawText(item.label, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.text,
    })

    page.drawText(formatCurrency(item.amount), {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.text,
    })
    yPosition -= 18
  })

  // Subtotal line
  yPosition -= 5
  page.drawLine({
    start: { x: margin + 20, y: yPosition },
    end: { x: width - margin - 20, y: yPosition },
    thickness: 1,
    color: colors.border,
  })
  yPosition -= 15

  page.drawText('Pre-discount Subtotal:', {
    x: margin + 20,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: colors.text,
  })

  page.drawText(formatCurrency(pricingBreakdown.preDiscountSubtotal), {
    x: width - margin - 100,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: colors.text,
  })
  yPosition -= 25

  // Discount (if applicable)
  if (pricingBreakdown.discountAmount > 0) {
    page.drawText(`Discount (${formData.discountReason}):`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.success,
    })

    page.drawText(`-${formatCurrency(pricingBreakdown.discountAmount)}`, {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.success,
    })
    yPosition -= 20

    page.drawText('After Discount:', {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.text,
    })

    page.drawText(formatCurrency(pricingBreakdown.afterDiscountSubtotal), {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.text,
    })
    yPosition -= 20
  }

  // Tax
  page.drawText('Tax:', {
    x: margin + 20,
    y: yPosition,
    size: 11,
    font: regularFont,
    color: colors.text,
  })

  page.drawText(formatCurrency(pricingBreakdown.tax), {
    x: width - margin - 100,
    y: yPosition,
    size: 11,
    font: regularFont,
    color: colors.text,
  })
  yPosition -= 25

  // Final total
  page.drawRectangle({
    x: margin + 10,
    y: yPosition - 10,
    width: width - 2 * margin - 20,
    height: 30,
    color: colors.primary,
  })

  page.drawText('TOTAL:', {
    x: margin + 20,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText(formatCurrency(pricingBreakdown.finalTotal), {
    x: width - margin - 100,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  // Move to footer position with proper spacing
  yPosition -= 60 // Space after total

  // Check if we need a new page for footer
  checkAndAddPage(60)

  // Footer background
  page.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: width - 2 * margin,
    height: 30,
    color: colors.muted,
  })

  // Footer text - left aligned
  page.drawText('This quotation is valid for 30 days from the date issued.', {
    x: margin + 15,
    y: yPosition + 8,
    size: 10,
    font: regularFont,
    color: colors.primary,
  })

  // Footer text - right aligned
  const thankYouText = 'Thank you for your business!'
  const thankYouWidth = thankYouText.length * 5.5 // Better width calculation
  page.drawText(thankYouText, {
    x: width - margin - thankYouWidth - 15,
    y: yPosition + 8,
    size: 10,
    font: boldFont,
    color: colors.primary,
  })

  // Generate PDF bytes and return as blob
  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
