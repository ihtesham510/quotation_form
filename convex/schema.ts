import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const curtainsSchema = {
  quoteData: v.object({
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
            productId: v.id('products'),
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
    gstEnabled: v.boolean(),
    gstRate: v.number(),
  }),

  // Calculations object
  calculations: v.object({
    subtotal: v.number(),
    discount: v.number(),
    tax: v.number(),
    gst: v.number(),
    total: v.number(),
    roomTotals: v.array(
      v.object({
        roomId: v.string(),
        total: v.number(),
      }),
    ),
    productTotals: v.array(
      v.object({
        roomId: v.string(),
        productId: v.id('products'),
        total: v.number(),
      }),
    ),
  }),

  // Metadata object
  metadata: v.object({
    generatedAt: v.string(),
    itemCount: v.number(),
    roomCount: v.number(),
  }),
}

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
  name: v.string(),
  description: v.string(),
}

export default defineSchema({
  categories: defineTable(categorySchema),
  products: defineTable(productSchema).index('by_category', ['categoryId']),
  user: defineTable({
    first_name: v.string(),
    last_name: v.string(),
    email: v.string(),
    password: v.string(),
  }).index('by_email', ['email']),
  quotation: defineTable({
    userId: v.id('user'),
    ...curtainsSchema,
  }).index('by_userId', ['userId']),
})
