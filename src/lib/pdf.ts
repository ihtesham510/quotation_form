import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type {
  TilePricingBreakdown as PricingBreakdown,
  TileFormData as FormData,
} from '@/lib/types'
import type {
  ProductDatabase,
  Product,
  Category,
} from '@/components/curtains_form/types'
import type { QuoteData } from '@/components/curtains_form/types'

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

export async function generateTilePDFfromDB(
  data: FormData,
  title: string,
  description: string,
): Promise<Blob> {
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
    { label: 'Material:', value: data.tileMaterial },
    { label: 'Style:', value: data.tileStyle },
    { label: 'Size:', value: data.tileSize },
    { label: 'Finish Type:', value: data.finishType },
    { label: 'Application Area:', value: data.applicationArea },
    {
      label: 'Square Footage:',
      value: data.squareFootage.toString() + ' sq ft',
    },
  ])

  // Trim Pieces & Accessories
  const accessoryItems: Array<{ label: string; value: string }> = []

  if (data.trimPieces.length > 0) {
    data.trimPieces.forEach((trim) => {
      accessoryItems.push({
        label: `${trim.type} (Trim):`,
        value: `Qty: ${trim.quantity} - ${formatCurrency(trim.price)}`,
      })
    })
  }

  if (data.transitionStrips.length > 0) {
    data.transitionStrips.forEach((strip) => {
      accessoryItems.push({
        label: `${strip.type} (Transition):`,
        value: `Qty: ${strip.quantity} - ${formatCurrency(strip.price)}`,
      })
    })
  }

  if (data.underlayment) {
    accessoryItems.push({
      label: `${data.underlayment.type} (Underlayment):`,
      value: formatCurrency(data.underlayment.price),
    })
  }

  if (data.groutSealers.length > 0) {
    data.groutSealers.forEach((sealer) => {
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
  if (data.otherItems.length > 0) {
    const otherItemsList = data.otherItems.map((item) => ({
      label: `${item.name}:`,
      value: `${item.quantity} ${item.unit} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)}`,
    }))
    drawSection('Additional Items', otherItemsList)
  }

  // Installation & Delivery
  const installationItems: Array<{ label: string; value: string }> = [
    { label: 'Delivery Option:', value: data.deliveryOption },
  ]

  if (data.installationComplexity.length > 0) {
    installationItems.push({
      label: 'Installation Complexity:',
      value: data.installationComplexity.join(', '),
    })
  }

  if (data.permitFees > 0) {
    installationItems.push({
      label: 'Permit Fees:',
      value: formatCurrency(data.permitFees),
    })
  }

  if (data.rushOrder) {
    installationItems.push({ label: 'Rush Order:', value: 'Yes' })
  }

  if (data.weekendWork) {
    installationItems.push({ label: 'Weekend Work:', value: 'Yes' })
  }

  drawSection('Installation & Delivery', installationItems)

  // Calculate pricing breakdown
  const materialCost = 0 // You may need to add this field to your FormData type
  const installationCost = 0 // You may need to add this field to your FormData type

  const trimTotal = data.trimPieces.reduce((sum, item) => sum + item.price, 0)
  const transitionTotal = data.transitionStrips.reduce(
    (sum, item) => sum + item.price,
    0,
  )
  const underlaymentTotal = data.underlayment ? data.underlayment.price : 0
  const groutTotal = data.groutSealers.reduce(
    (sum, item) => sum + item.price,
    0,
  )
  const addOnsSubtotal =
    trimTotal + transitionTotal + underlaymentTotal + groutTotal

  const otherItemsSubtotal = data.otherItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  )

  const additionalChargesSubtotal = data.permitFees
  const preDiscountSubtotal =
    materialCost +
    installationCost +
    addOnsSubtotal +
    otherItemsSubtotal +
    additionalChargesSubtotal

  const discountAmount =
    data.discountAmount + (preDiscountSubtotal * data.discountPercentage) / 100
  const afterDiscountSubtotal = preDiscountSubtotal - discountAmount
  const tax = 0 // You may need to add tax calculation
  const finalTotal = afterDiscountSubtotal + tax

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
    { label: 'Material Cost:', amount: materialCost },
    { label: 'Installation Cost:', amount: installationCost },
    { label: 'Add-ons Subtotal:', amount: addOnsSubtotal },
    { label: 'Other Items Subtotal:', amount: otherItemsSubtotal },
    { label: 'Additional Charges:', amount: additionalChargesSubtotal },
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

  page.drawText(formatCurrency(preDiscountSubtotal), {
    x: width - margin - 100,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: colors.text,
  })
  yPosition -= 25

  // Discount (if applicable)
  if (discountAmount > 0) {
    page.drawText(`Discount (${data.discountReason || data.discountType}):`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.success,
    })

    page.drawText(`-${formatCurrency(discountAmount)}`, {
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

    page.drawText(formatCurrency(afterDiscountSubtotal), {
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

  page.drawText(formatCurrency(tax), {
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

  page.drawText(formatCurrency(finalTotal), {
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

interface WindowQuoteParams {
  title: string
  description?: string
  quoteData: QuoteData
  productDatabase: ProductDatabase
}
export async function generateWindowQuotePdf({
  title,
  description,
  quoteData,
  productDatabase,
}: WindowQuoteParams): Promise<Blob> {
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

  // Helper function to get product by ID
  const getProductById = (productId: number): Product | undefined => {
    return productDatabase.products.find((p) => p.id === productId)
  }

  // Helper function to get category by ID
  const getCategoryById = (categoryId: number): Category | undefined => {
    return productDatabase.categories.find((c) => c.id === categoryId)
  }

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

  // Quote Info (top right)
  const quoteDate = new Date(quoteData.quoteDate).toLocaleDateString()
  page.drawText(`Quote Date: ${quoteDate}`, {
    x: width - margin - 150,
    y: height - margin - 60,
    size: 10,
    font: regularFont,
    color: colors.secondary,
  })

  page.drawText(`Valid for: ${quoteData.validityPeriod} days`, {
    x: width - margin - 150,
    y: height - margin - 80,
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

  // Customer Information
  drawSection('Customer Information', [
    { label: 'Name:', value: quoteData.customer.name },
    { label: 'Email:', value: quoteData.customer.email },
    { label: 'Phone:', value: quoteData.customer.phone },
    { label: 'Address:', value: quoteData.customer.address },
    { label: 'Project Address:', value: quoteData.customer.projectAddress },
  ])

  // Calculate totals
  let roomsSubtotal = 0
  let addOnsSubtotal = 0

  // Room Details and Products
  quoteData.rooms.forEach((room, roomIndex) => {
    checkAndAddPage(120)

    // Room header
    page.drawRectangle({
      x: margin,
      y: yPosition - 5,
      width: width - 2 * margin,
      height: 25,
      color: colors.accent,
    })

    page.drawText(`Room ${roomIndex + 1}: ${room.name} (${room.type})`, {
      x: margin + 10,
      y: yPosition + 5,
      size: 14,
      font: boldFont,
      color: colors.primary,
    })
    yPosition -= 40

    // Room products
    room.products.forEach((roomProduct) => {
      checkAndAddPage(60)

      const product = getProductById(roomProduct.productId)
      if (!product) return

      const category = getCategoryById(product.categoryId)

      // Calculate product cost
      let productCost = 0
      if (roomProduct.customPrice !== undefined) {
        productCost = roomProduct.customPrice * roomProduct.quantity
      } else {
        if (product.priceType === 'sqm') {
          const area = (roomProduct.width / 1000) * (roomProduct.height / 1000) // Convert mm to m
          productCost = area * product.basePrice * roomProduct.quantity
        } else {
          productCost = product.basePrice * roomProduct.quantity
        }
      }

      roomsSubtotal += productCost

      // Product details
      page.drawText(`• ${product.name}`, {
        x: margin + 20,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: colors.text,
      })
      yPosition -= 16

      page.drawText(`  Category: ${category?.name || 'Unknown'}`, {
        x: margin + 30,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: colors.secondary,
      })
      yPosition -= 14

      page.drawText(
        `  Dimensions: ${roomProduct.width}mm × ${roomProduct.height}mm`,
        {
          x: margin + 30,
          y: yPosition,
          size: 9,
          font: regularFont,
          color: colors.secondary,
        },
      )

      page.drawText(`Qty: ${roomProduct.quantity}`, {
        x: margin + 250,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: colors.secondary,
      })
      yPosition -= 14

      page.drawText(
        `  Color: ${roomProduct.color} | Control: ${roomProduct.controlType}`,
        {
          x: margin + 30,
          y: yPosition,
          size: 9,
          font: regularFont,
          color: colors.secondary,
        },
      )

      page.drawText(formatCurrency(productCost), {
        x: width - margin - 100,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: colors.text,
      })
      yPosition -= 14

      if (roomProduct.installation) {
        page.drawText(`  Installation: Included`, {
          x: margin + 30,
          y: yPosition,
          size: 9,
          font: regularFont,
          color: colors.success,
        })
        yPosition -= 14
      }

      if (roomProduct.specialFeatures) {
        page.drawText(`  Special Features: ${roomProduct.specialFeatures}`, {
          x: margin + 30,
          y: yPosition,
          size: 9,
          font: regularFont,
          color: colors.secondary,
        })
        yPosition -= 14
      }

      yPosition -= 10 // Space between products
    })

    yPosition -= 15 // Space between rooms
  })

  // Add-ons Section
  if (quoteData.addOns.length > 0) {
    const addOnItems = quoteData.addOns.map((addOn) => {
      const totalCost = addOn.unitPrice * addOn.quantity
      addOnsSubtotal += totalCost

      return {
        label: `${addOn.name} (${addOn.description}):`,
        value: `${addOn.quantity} ${addOn.unitType} × ${formatCurrency(addOn.unitPrice)} = ${formatCurrency(totalCost)}`,
      }
    })
    drawSection('Add-ons & Accessories', addOnItems)
  }

  // Service Options
  const serviceItems: Array<{ label: string; value: string }> = [
    { label: 'Delivery Option:', value: quoteData.deliveryOption },
    {
      label: 'Installation Service:',
      value: quoteData.installationService ? 'Yes' : 'No',
    },
    {
      label: 'Site Measurement:',
      value: quoteData.siteMeasurement ? 'Yes' : 'No',
    },
    { label: 'Payment Terms:', value: quoteData.paymentTerms },
  ]

  drawSection('Service Options', serviceItems)

  // Pricing Breakdown
  checkAndAddPage(200)

  // Calculate pricing
  const subtotal = roomsSubtotal + addOnsSubtotal
  let discountAmount = 0

  if (quoteData.discountValue > 0) {
    if (quoteData.discountType === 'percentage') {
      discountAmount = subtotal * (quoteData.discountValue / 100)
    } else {
      discountAmount = quoteData.discountValue
    }
  }

  const afterDiscountSubtotal = subtotal - discountAmount
  const tax = afterDiscountSubtotal * (quoteData.taxRate / 100)
  const finalTotal = afterDiscountSubtotal + tax

  // Pricing header
  page.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: width - 2 * margin,
    height: 25,
    color: colors.primary,
  })

  page.drawText('Pricing Summary', {
    x: margin + 10,
    y: yPosition + 5,
    size: 16,
    font: boldFont,
    color: rgb(1, 1, 1),
  })
  yPosition -= 45

  // Pricing items
  const pricingItems = [
    { label: 'Room Products Subtotal:', amount: roomsSubtotal },
    { label: 'Add-ons Subtotal:', amount: addOnsSubtotal },
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

  page.drawText('Subtotal:', {
    x: margin + 20,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: colors.text,
  })

  page.drawText(formatCurrency(subtotal), {
    x: width - margin - 100,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: colors.text,
  })
  yPosition -= 25

  // Discount (if applicable)
  if (discountAmount > 0) {
    const discountLabel =
      quoteData.discountType === 'percentage'
        ? `Discount (${quoteData.discountValue}% - ${quoteData.discountReason}):`
        : `Discount (${quoteData.discountReason}):`

    page.drawText(discountLabel, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.success,
    })

    page.drawText(`-${formatCurrency(discountAmount)}`, {
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

    page.drawText(formatCurrency(afterDiscountSubtotal), {
      x: width - margin - 100,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: colors.text,
    })
    yPosition -= 20
  }

  // Tax
  page.drawText(`Tax (${quoteData.taxRate}%):`, {
    x: margin + 20,
    y: yPosition,
    size: 11,
    font: regularFont,
    color: colors.text,
  })

  page.drawText(formatCurrency(tax), {
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

  page.drawText(formatCurrency(finalTotal), {
    x: width - margin - 100,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  // Move to footer position with proper spacing
  yPosition -= 60

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
  page.drawText(
    `This quotation is valid for ${quoteData.validityPeriod} days from the date issued.`,
    {
      x: margin + 15,
      y: yPosition + 8,
      size: 10,
      font: regularFont,
      color: colors.primary,
    },
  )

  // Footer text - right aligned
  const thankYouText = 'Thank you for choosing our window treatments!'
  const thankYouWidth = thankYouText.length * 5.5
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
