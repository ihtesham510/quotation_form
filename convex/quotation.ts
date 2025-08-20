import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { curtainsSchema } from './curtains_schema'
import { quotationData as tileQuotationData } from './tile_schema'

export const getQuotations = query({
	args: {
		userId: v.id('user'),
	},
	async handler(ctx, args) {
		return await ctx.db
			.query('quotation')
			.withIndex('by_userId', q => q.eq('userId', args.userId))
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

export const getTileQuotations = query({
	args: {
		userId: v.id('user'),
	},
	async handler(ctx, { userId }) {
		return await ctx.db
			.query('tile_quotation')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect()
	},
})
export const getTileQuotation = query({
	args: {
		tile_quotation_id: v.id('tile_quotation'),
	},
	async handler(ctx, { tile_quotation_id }) {
		return await ctx.db.get(tile_quotation_id)
	},
})

export const addTileQuotation = mutation({
	args: {
		userId: v.id('user'),
		...tileQuotationData,
	},
	async handler(ctx, args) {
		return await ctx.db.insert('tile_quotation', args)
	},
})

export const deleteTileQuotation = mutation({
	args: {
		quotationId: v.id('tile_quotation'),
	},
	async handler(ctx, { quotationId }) {
		return await ctx.db.delete(quotationId)
	},
})
