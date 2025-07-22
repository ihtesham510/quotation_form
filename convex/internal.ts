import { v } from 'convex/values'
import { internalMutation } from './_generated/server'

export const store_file = internalMutation({
  args: {
    url: v.string(),
    storageId: v.id('_storage'),
  },
  async handler(ctx, args) {
    return await ctx.db.insert('files', args)
  },
})
