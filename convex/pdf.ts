'use node'

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { v } from 'convex/values'

export const generatePDF = internalAction({
  args: { data: v.optional(v.any()) },
  async handler(ctx, args) {
    if (args.data) {
      const blob = await generatePDFQuote(args.data)
      const id = await ctx.storage.store(blob)
      const url = await ctx.storage.getUrl(id)
      if (id && url) {
        await ctx.runMutation(internal.internal.store_file, {
          storageId: id,
          url,
        })
      }
      return url
    }
    return null
  },
})

interface RoomDetails {
  roomType: string
  roomIndex: number
  curtainType: 'SWAVE' | 'SWAVE BO' | ''
  curtainsSize: string
  motorized: boolean
  fabric: string
}

interface ShutterDetails {
  location: string
  quantity: number
}

interface RollerBlindDetails {
  withTracks: boolean
}

interface Addon {
  name: string
  amount: number
}

interface Discount {
  percentage: number
}

interface QuoteData {
  roomDetails: RoomDetails[]
  shutterDetails: ShutterDetails[]
  rollerBlindDetails: RollerBlindDetails
  addons: Addon[]
  discount: Discount
  wantsShutters: boolean
  wantsRollerBlinds: boolean
  wantsDiscount: boolean
  subtotal: number
  finalTotal: number
}

export async function generatePDFQuote(data: QuoteData): Promise<Blob> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()

  // Add a page
  const page = pdfDoc.addPage([595.276, 841.89]) // A4 size in points
  const { width, height } = page.getSize()

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Define colors
  const primaryColor = rgb(0.2, 0.4, 0.8)
  const textColor = rgb(0.2, 0.2, 0.2)
  const subtleColor = rgb(0.5, 0.5, 0.5)

  // Define starting positions
  let yPosition = height - 80
  const leftMargin = 50
  const rightMargin = width - 50
  const lineHeight = 20

  // Helper function to draw a line
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color: subtleColor,
    })
  }

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition - requiredSpace < 50) {
      const newPage = pdfDoc.addPage([595.276, 841.89])
      yPosition = newPage.getSize().height - 80
      return newPage
    }
    return page
  }

  let currentPage = page

  // Title
  currentPage.drawText('CURTAIN & BLINDS QUOTE', {
    x: leftMargin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: primaryColor,
  })
  yPosition -= 40

  // Date
  const currentDate = new Date().toLocaleDateString()
  currentPage.drawText(`Quote Date: ${currentDate}`, {
    x: leftMargin,
    y: yPosition,
    size: 12,
    font: regularFont,
    color: textColor,
  })
  yPosition -= 30

  // Divider line
  drawLine(leftMargin, yPosition, rightMargin, yPosition)
  yPosition -= 30

  // Room Curtains Section
  if (data.roomDetails.length > 0) {
    currentPage = checkNewPage(60)

    currentPage.drawText('ROOM CURTAINS', {
      x: leftMargin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: primaryColor,
    })
    yPosition -= 25

    data.roomDetails.forEach((room) => {
      currentPage = checkNewPage(40)

      const roomText = `${room.roomType}${room.roomIndex > 1 ? ` #${room.roomIndex}` : ''}`
      const curtainText = `${room.curtainType} curtains in ${room.fabric}`
      const motorizedText = room.motorized ? ' (Motorized)' : ''
      const sizeText = ` - Size: ${room.curtainsSize}`

      currentPage.drawText(`• ${roomText}`, {
        x: leftMargin + 10,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: textColor,
      })
      yPosition -= lineHeight

      currentPage.drawText(`  ${curtainText}${motorizedText}${sizeText}`, {
        x: leftMargin + 20,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: subtleColor,
      })
      yPosition -= lineHeight
    })

    yPosition -= 10
  }

  // Shutters Section
  if (data.wantsShutters && data.shutterDetails.length > 0) {
    currentPage = checkNewPage(60)

    currentPage.drawText('SHUTTERS', {
      x: leftMargin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: primaryColor,
    })
    yPosition -= 25

    data.shutterDetails.forEach((shutter) => {
      currentPage = checkNewPage(25)

      const shutterText = `${shutter.location} - ${shutter.quantity} unit${shutter.quantity > 1 ? 's' : ''}`

      currentPage.drawText(`• ${shutterText}`, {
        x: leftMargin + 10,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: textColor,
      })
      yPosition -= lineHeight
    })

    yPosition -= 10
  }

  // Roller Blinds Section
  if (data.wantsRollerBlinds) {
    currentPage = checkNewPage(60)

    currentPage.drawText('ROLLER BLINDS', {
      x: leftMargin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: primaryColor,
    })
    yPosition -= 25

    const blindsText = `Roller Blinds ${data.rollerBlindDetails.withTracks ? 'with tracks' : 'without tracks'}`

    currentPage.drawText(`• ${blindsText}`, {
      x: leftMargin + 10,
      y: yPosition,
      size: 12,
      font: regularFont,
      color: textColor,
    })
    yPosition -= lineHeight + 10
  }

  // Additional Charges Section
  if (data.addons.length > 0) {
    currentPage = checkNewPage(60)

    currentPage.drawText('ADDITIONAL CHARGES', {
      x: leftMargin,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: primaryColor,
    })
    yPosition -= 25

    data.addons.forEach((addon) => {
      currentPage = checkNewPage(25)

      currentPage.drawText(`• ${addon.name}`, {
        x: leftMargin + 10,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: textColor,
      })

      currentPage.drawText(`$${addon.amount.toFixed(2)}`, {
        x: rightMargin - 80,
        y: yPosition,
        size: 12,
        font: regularFont,
        color: textColor,
      })
      yPosition -= lineHeight
    })

    yPosition -= 10
  }

  // Pricing Section
  currentPage = checkNewPage(120)

  // Divider line
  drawLine(leftMargin, yPosition, rightMargin, yPosition)
  yPosition -= 30

  currentPage.drawText('PRICING SUMMARY', {
    x: leftMargin,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: primaryColor,
  })
  yPosition -= 30

  // Subtotal
  currentPage.drawText('Subtotal:', {
    x: leftMargin,
    y: yPosition,
    size: 12,
    font: regularFont,
    color: textColor,
  })

  currentPage.drawText(`$${data.subtotal.toFixed(2)}`, {
    x: rightMargin - 80,
    y: yPosition,
    size: 12,
    font: regularFont,
    color: textColor,
  })
  yPosition -= lineHeight

  // Discount (if applicable)
  if (data.wantsDiscount && data.discount.percentage > 0) {
    const discountAmount = (data.subtotal * data.discount.percentage) / 100

    currentPage.drawText(`Discount (${data.discount.percentage}%):`, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: regularFont,
      color: rgb(0.8, 0.2, 0.2),
    })

    currentPage.drawText(`-$${discountAmount.toFixed(2)}`, {
      x: rightMargin - 80,
      y: yPosition,
      size: 12,
      font: regularFont,
      color: rgb(0.8, 0.2, 0.2),
    })
    yPosition -= lineHeight
  }

  // Final divider line
  drawLine(leftMargin, yPosition - 5, rightMargin, yPosition - 5)
  yPosition -= 20

  // Final Total
  currentPage.drawText('Final Total:', {
    x: leftMargin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: textColor,
  })

  currentPage.drawText(`$${data.finalTotal.toFixed(2)}`, {
    x: rightMargin - 80,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: primaryColor,
  })

  // Footer
  yPosition -= 40
  currentPage.drawText('Thank you for your business!', {
    x: leftMargin,
    y: yPosition,
    size: 10,
    font: regularFont,
    color: subtleColor,
  })

  currentPage.drawText(
    'This quote is valid for 30 days from the date of issue.',
    {
      x: leftMargin,
      y: yPosition - 15,
      size: 8,
      font: regularFont,
      color: subtleColor,
    },
  )

  // Serialize the PDF document to bytes
  const pdfBytes = await pdfDoc.save()

  // Create and return a Blob
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
