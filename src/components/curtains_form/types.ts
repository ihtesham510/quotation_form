export interface Customer {
  name: string
  email: string
  phone: string
  address: string
  projectAddress: string
}

export interface Room {
  id: string
  name: string
  type: string
  products: RoomProduct[]
}

export interface RoomProduct {
  id: string
  productId: number
  width: number
  height: number
  quantity: number
  customPrice?: number
  color: string
  controlType: string
  installation: boolean
  specialFeatures: string
}

export interface AddOn {
  id: string
  name: string
  description: string
  unitType: string
  unitPrice: number
  quantity: number
}

export interface QuoteData {
  customer: Customer
  rooms: Room[]
  addOns: AddOn[]
  deliveryOption: string
  installationService: boolean
  siteMeasurement: boolean
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountReason: string
  taxRate: number
  paymentTerms: string
  quoteDate: string
  validityPeriod: number
}

export interface Product {
  id: number
  categoryId: number
  name: string
  priceType: 'sqm' | 'each'
  basePrice: number
  minimumQty: number
  leadTime: string
  specialConditions: string
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface ProductDatabase {
  categories: Category[]
  products: Product[]
}
