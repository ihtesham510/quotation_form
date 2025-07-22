import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const addFormForUser = mutation({
  args: {
    userId: v.id('user'),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal('tile'), v.literal('curtains')),
  },
  async handler(ctx, args) {
    return await ctx.db.insert('forms', args)
  },
})

export const getForms = query({
  args: { userId: v.id('user') },
  async handler(ctx, args) {
    return await ctx.db
      .query('forms')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()
  },
})

export const getForm = query({
  args: { userId: v.id('user'), formId: v.id('forms') },
  async handler(ctx, args) {
    const form = await ctx.db.get(args.formId)
    return form && form.userId === args.userId ? form : null
  },
})
