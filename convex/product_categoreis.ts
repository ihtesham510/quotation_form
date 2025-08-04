import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { categorySchema, productSchema } from './schema'

export const getProductAndCategories = query({
  args: {
    userId: v.optional(v.id('user')),
  },
  async handler(ctx, { userId }) {
    if (!userId) return null
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
    const products = await Promise.all(
      categories.map(
        async (cat) =>
          await ctx.db
            .query('products')
            .withIndex('by_category', (q) => q.eq('categoryId', cat._id))
            .collect(),
      ),
    ).then((results) => results.flat())
    return {
      categories,
      products,
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
