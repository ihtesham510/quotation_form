import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { categorySchema, productSchema } from './schema'

export const getProductAndCategories = query({
  async handler(ctx) {
    return {
      categories: await ctx.db.query('categories').collect(),
      products: await ctx.db.query('products').collect(),
    }
  },
})

export const addProduct = mutation({
  args: { ...productSchema },
  async handler(ctx, args) {
    return await ctx.db.insert('products', args)
  },
})

export const addCategory = mutation({
  args: {
    ...categorySchema,
  },
  async handler(ctx, args) {
    return await ctx.db.insert('categories', args)
  },
})

export const deleteProduct = mutation({
  args: { productId: v.id('products') },
  async handler(ctx, args) {
    return await ctx.db.delete(args.productId)
  },
})

export const deleteCategory = mutation({
  args: { categoryId: v.id('categories') },
  async handler(ctx, args) {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('categoryId', args.categoryId))
      .collect()
    await Promise.all(
      products.map(async (prod) => await ctx.db.delete(prod._id)),
    )
    return await ctx.db.delete(args.categoryId)
  },
})

export const updateProduct = mutation({
  args: { productId: v.id('products'), ...productSchema },
  async handler(ctx, { productId, ...args }) {
    return await ctx.db.patch(productId, args)
  },
})

export const updateCategory = mutation({
  args: {
    categoryId: v.id('categories'),
    ...categorySchema,
  },
  async handler(ctx, { categoryId, ...args }) {
    return await ctx.db.patch(categoryId, args)
  },
})
