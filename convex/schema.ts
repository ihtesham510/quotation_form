import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { categorySchema, productSchema, curtainsSchema } from './curtains_schema'
import {
	quotationData,
	tile_finishes_schema,
	tile_material_schema,
	tile_sizes_schema,
	tile_styles_schema,
} from './tile_schema'

export default defineSchema({
	categories: defineTable(categorySchema).index('by_userId', ['userId']),
	products: defineTable(productSchema).index('by_category', ['categoryId']),
	tile_material: defineTable(tile_material_schema).index('by_userId', ['userId']),
	tile_styles: defineTable(tile_styles_schema).index('by_userId', ['userId']),
	tile_sizes: defineTable(tile_sizes_schema).index('by_userId', ['userId']),
	tile_finishes: defineTable(tile_finishes_schema).index('by_userId', ['userId']),
	tile_quotation: defineTable({ userId: v.id('user'), ...quotationData }).index('by_userId', ['userId']),
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
