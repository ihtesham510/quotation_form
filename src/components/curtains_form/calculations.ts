import type { QuoteData, RoomProduct, Room } from './types'
import { productDatabase } from './data'

export const calculateProductTotal = (product: RoomProduct): number => {
  const productInfo = productDatabase.products.find(
    (p) => p.id === product.productId,
  )
  if (!productInfo) return 0

  const sqm = product.width * product.height
  const price = product.customPrice || productInfo.basePrice

  if (productInfo.priceType === 'sqm') {
    const minSqm = productInfo.minimumQty
    const billableSqm = Math.max(sqm, minSqm)
    return billableSqm * price * product.quantity
  } else {
    return price * product.quantity
  }
}

export const calculateRoomTotal = (room: Room): number => {
  return room.products.reduce(
    (total, product) => total + calculateProductTotal(product),
    0,
  )
}

export const calculateSubtotal = (quoteData: QuoteData): number => {
  const roomsTotal = quoteData.rooms.reduce(
    (total, room) => total + calculateRoomTotal(room),
    0,
  )
  const addOnsTotal = quoteData.addOns.reduce(
    (total, addOn) => total + addOn.unitPrice * addOn.quantity,
    0,
  )

  let servicesTotal = 0
  if (quoteData.installationService) servicesTotal += 150
  if (quoteData.siteMeasurement) servicesTotal += 75
  if (quoteData.deliveryOption === 'express') servicesTotal += 50

  return roomsTotal + addOnsTotal + servicesTotal
}

export const calculateDiscount = (quoteData: QuoteData): number => {
  const subtotal = calculateSubtotal(quoteData)
  if (quoteData.discountType === 'percentage') {
    return subtotal * (quoteData.discountValue / 100)
  } else {
    return Math.min(quoteData.discountValue, subtotal)
  }
}

export const calculateTax = (quoteData: QuoteData): number => {
  const afterDiscount =
    calculateSubtotal(quoteData) - calculateDiscount(quoteData)
  return afterDiscount * (quoteData.taxRate / 100)
}

export const calculateTotal = (quoteData: QuoteData): number => {
  return (
    calculateSubtotal(quoteData) -
    calculateDiscount(quoteData) +
    calculateTax(quoteData)
  )
}
