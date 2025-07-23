import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { curtainsSchema, tileSchema } from './schema'

export const getQuotations = query({
  args: {
    userId: v.id('user'),
  },
  async handler(ctx, args) {
    const quotations = await ctx.db.query('quotation').collect()
    const forms = await ctx.db
      .query('forms')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect()
    const filtered_forms = forms.map((f) => f._id)
    return quotations
      .filter((quote) => filtered_forms.includes(quote.formsId))
      .map((q) => {
        const form = forms.find((f) => f._id === q.formsId)
        return { ...q, title: form?.title, description: form?.description }
      })
  },
})

export const getQuotation = query({
  args: {
    quotationId: v.id('quotation'),
  },
  async handler(ctx, args) {
    const quotation = await ctx.db.get(args.quotationId)
    const form = await ctx.db.get(quotation!.formsId)
    if (form && quotation)
      return { ...quotation, title: form.title, description: form.description }
    return null
  },
})

export const addTileQuotation = mutation({
  args: { data: tileSchema, formId: v.id('forms') },
  async handler(ctx, args) {
    return await ctx.db.insert('quotation', {
      formsId: args.formId,
      quote: args.data,
    })
  },
})
export const addCurtainQuotation = mutation({
  args: { data: curtainsSchema, formId: v.id('forms') },
  async handler(ctx, args) {
    return await ctx.db.insert('quotation', {
      formsId: args.formId,
      quote: args.data,
    })
  },
})
