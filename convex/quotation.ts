import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { curtainsSchema } from './schema'

export const getQuotations = query({
  args: {
    userId: v.id('user'),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query('quotation')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()
  },
})

export const getQuotation = query({
  args: {
    quotationId: v.id('quotation'),
  },
  handler: async (ctx, args) => await ctx.db.get(args.quotationId),
})

export const addCurtainQuotation = mutation({
  args: { ...curtainsSchema, userId: v.id('user') },
  async handler(ctx, args) {
    return await ctx.db.insert('quotation', args)
  },
})
