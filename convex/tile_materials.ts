import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { tile_finishes_schema, tile_material_schema, tile_sizes_schema, tile_styles_schema } from './tile_schema'

export const getTileData = query({
	args: {
		userId: v.id('user'),
	},
	async handler(ctx, { userId }) {
		const materials = await ctx.db
			.query('tile_material')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect()

		const styleIds = [...new Set(materials.flatMap(mat => mat.styleIds))]
		const finishesIds = [...new Set(materials.flatMap(mat => mat.finishIds))]
		const sizesIds = [...new Set(materials.flatMap(mat => mat.sizeIds))]

		const styles = (await Promise.all(styleIds.map(async id => await ctx.db.get(id)))).filter(style => !!style)
		const finish = (await Promise.all(finishesIds.map(async id => await ctx.db.get(id)))).filter(f => !!f)
		const sizes = (await Promise.all(sizesIds.map(async id => await ctx.db.get(id)))).filter(size => !!size)

		return { materials, finish, sizes, styles }
	},
})

export const getMaterials = query({
	args: {
		userId: v.id('user'),
	},
	handler: async (ctx, { userId }) =>
		await ctx.db
			.query('tile_material')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect(),
})

export const getStyles = query({
	args: {
		userId: v.id('user'),
	},
	handler: async (ctx, { userId }) =>
		await ctx.db
			.query('tile_styles')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect(),
})

export const getSizes = query({
	args: {
		userId: v.id('user'),
	},
	handler: async (ctx, { userId }) =>
		await ctx.db
			.query('tile_sizes')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect(),
})

export const getFinishes = query({
	args: {
		userId: v.id('user'),
	},
	handler: async (ctx, { userId }) =>
		await ctx.db
			.query('tile_finishes')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect(),
})

export const getAlldata = query({
	args: {
		userId: v.id('user'),
	},
	async handler(ctx, { userId }) {
		const materials = await ctx.db
			.query('tile_material')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect()
		const finish = await ctx.db
			.query('tile_finishes')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect()
		const styles = await ctx.db
			.query('tile_styles')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect()
		const sizes = await ctx.db
			.query('tile_sizes')
			.withIndex('by_userId', q => q.eq('userId', userId))
			.collect()
		return { materials, finish, styles, sizes }
	},
})

export const addSize = mutation({
	args: tile_sizes_schema,
	async handler(ctx, args) {
		return await ctx.db.insert('tile_sizes', args)
	},
})

export const addStyle = mutation({
	args: tile_styles_schema,
	async handler(ctx, args) {
		return await ctx.db.insert('tile_styles', args)
	},
})

export const addMaterial = mutation({
	args: tile_material_schema,
	async handler(ctx, args) {
		return await ctx.db.insert('tile_material', args)
	},
})

export const addFinish = mutation({
	args: tile_finishes_schema,
	async handler(ctx, args) {
		return await ctx.db.insert('tile_finishes', args)
	},
})

export const updateSize = mutation({
	args: { ...tile_sizes_schema, id: v.id('tile_sizes') },
	async handler(ctx, { id, ...args }) {
		return await ctx.db.patch(id, args)
	},
})

export const updateStyle = mutation({
	args: { ...tile_styles_schema, id: v.id('tile_styles') },
	async handler(ctx, { id, ...args }) {
		return await ctx.db.patch(id, args)
	},
})

export const updateMaterial = mutation({
	args: { ...tile_material_schema, id: v.id('tile_material') },
	async handler(ctx, { id, ...args }) {
		return await ctx.db.patch(id, args)
	},
})

export const updateFinish = mutation({
	args: { id: v.id('tile_finishes'), ...tile_finishes_schema },
	async handler(ctx, { id, ...args }) {
		return await ctx.db.patch(id, args)
	},
})

export const deleteSize = mutation({
	args: { id: v.id('tile_sizes') },
	async handler(ctx, { id }) {
		return await ctx.db.delete(id)
	},
})

export const deleteStyle = mutation({
	args: { id: v.id('tile_styles') },
	async handler(ctx, { id }) {
		return await ctx.db.delete(id)
	},
})

export const delteMaterial = mutation({
	args: { id: v.id('tile_material') },
	async handler(ctx, { id }) {
		return await ctx.db.delete(id)
	},
})

export const deleteFinish = mutation({
	args: { id: v.id('tile_finishes') },
	async handler(ctx, { id }) {
		return await ctx.db.delete(id)
	},
})
