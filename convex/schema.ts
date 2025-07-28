import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const tileSchema = v.object({
  type: v.literal('tile'),
  // Step 1
  tileMaterial: v.string(),
  tileStyle: v.string(),

  // Step 2
  tileSize: v.string(),
  finishType: v.string(),
  applicationArea: v.string(),
  squareFootage: v.number(),

  // Step 3
  trimPieces: v.array(
    v.object({
      type: v.string(),
      quantity: v.number(),
      price: v.number(),
    }),
  ),
  transitionStrips: v.array(
    v.object({
      type: v.string(),
      quantity: v.number(),
      price: v.number(),
    }),
  ),
  underlayment: v.union(
    v.null(),
    v.object({
      type: v.string(),
      price: v.number(),
    }),
  ),
  groutSealers: v.array(
    v.object({
      type: v.string(),
      price: v.number(),
    }),
  ),

  // Step 4
  otherItems: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      quantity: v.number(),
      unit: v.string(),
      unitPrice: v.number(),
      description: v.string(),
    }),
  ),

  // Step 5
  deliveryOption: v.string(),
  installationComplexity: v.array(v.string()),
  permitFees: v.number(),
  rushOrder: v.boolean(),
  weekendWork: v.boolean(),

  // Step 6
  discountType: v.string(),
  discountPercentage: v.number(),
  discountAmount: v.number(),
  discountReason: v.string(),
})

export const curtainsSchema = v.object({
  type: v.literal('curtains'),
  customer: v.object({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
    projectAddress: v.string(),
  }),
  rooms: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      products: v.array(
        v.object({
          id: v.string(),
          productId: v.number(),
          width: v.number(),
          height: v.number(),
          quantity: v.number(),
          customPrice: v.optional(v.number()),
          color: v.string(),
          controlType: v.string(),
          installation: v.boolean(),
          specialFeatures: v.string(),
        }),
      ),
    }),
  ),
  addOns: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      unitType: v.string(),
      unitPrice: v.number(),
      quantity: v.number(),
    }),
  ),
  deliveryOption: v.string(),
  installationService: v.boolean(),
  siteMeasurement: v.boolean(),
  discountType: v.union(v.literal('percentage'), v.literal('fixed')),
  discountValue: v.number(),
  discountReason: v.string(),
  taxRate: v.number(),
  paymentTerms: v.string(),
  quoteDate: v.string(),
  validityPeriod: v.number(),
})

export const productSchema = {
  categoryId: v.id('categories'),
  name: v.string(),
  priceType: v.union(v.literal('sqm'), v.literal('each')),
  basePrice: v.number(),
  minimumQty: v.number(),
  leadTime: v.string(),
  specialConditions: v.optional(v.string()),
}

export const categorySchema = {
  title: v.string(),
  description: v.string(),
}

export default defineSchema({
  categories: defineTable(categorySchema),
  products: defineTable(productSchema).index('by_category', ['categoryId']),
  files: defineTable({
    url: v.string(),
    storageId: v.id('_storage'),
  }),
  user: defineTable({
    first_name: v.string(),
    last_name: v.string(),
    email: v.string(),
    password: v.string(),
  }).index('by_email', ['email']),
  forms: defineTable({
    userId: v.id('user'),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal('tile'), v.literal('curtains')),
  }).index('by_userId', ['userId']),
  quotation: defineTable({
    formsId: v.id('forms'),
    quote: v.union(tileSchema, curtainsSchema),
  })
    .index('by_form_id', ['formsId'])
    .index('by_quote_type', ['quote.type']),
})
