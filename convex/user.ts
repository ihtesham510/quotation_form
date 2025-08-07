import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const signUp = mutation({
	args: {
		first_name: v.string(),
		last_name: v.string(),
		email: v.string(),
		password: v.string(),
	},
	async handler(ctx, args) {
		const id = await ctx.db.insert('user', args)
		return id
	},
})

export const signIn = mutation({
	args: {
		email: v.string(),
		password: v.string(),
	},
	async handler(ctx, { email, password }) {
		const user = await ctx.db
			.query('user')
			.withIndex('by_email', q => q.eq('email', email))
			.first()
		if (user) {
			return user.password === password ? user._id : null
		}
	},
})

export const auth = query({
	args: {
		email: v.string(),
		password: v.string(),
	},
	async handler(ctx, { email, password }) {
		const user = await ctx.db
			.query('user')
			.withIndex('by_email', q => q.eq('email', email))
			.first()

		return user && user.password === password
	},
})

export const getUser = query({
	args: {
		userId: v.optional(v.id('user')),
	},
	async handler(ctx, { userId }) {
		if (userId) {
			return await ctx.db.get(userId)
		}
		return null
	},
})

export const userExists = query({
	args: {
		email: v.string(),
	},
	async handler(ctx, { email }) {
		return !!(await ctx.db
			.query('user')
			.withIndex('by_email', q => q.eq('email', email))
			.first())
	},
})
