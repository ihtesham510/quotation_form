export interface TileFormData {
  tileMaterial: string
  tileStyle: string
  tileSize: string
  finishType: string
  applicationArea: string
  squareFootage: number
  trimPieces: Array<{ type: string; quantity: number; price: number }>
  transitionStrips: Array<{ type: string; quantity: number; price: number }>
  underlayment: { type: string; price: number } | null
  groutSealers: Array<{ type: string; price: number }>
  otherItems: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    unitPrice: number
    description: string
  }>
  deliveryOption: string
  installationComplexity: string[]
  permitFees: number
  rushOrder: boolean
  weekendWork: boolean
  discountType: string
  discountPercentage: number
  discountAmount: number
  discountReason: string
}

export interface TilePricingBreakdown {
  materialCost: number
  installationCost: number
  addOnsSubtotal: number
  otherItemsSubtotal: number
  additionalChargesSubtotal: number
  preDiscountSubtotal: number
  discountAmount: number
  afterDiscountSubtotal: number
  tax: number
  finalTotal: number
}
