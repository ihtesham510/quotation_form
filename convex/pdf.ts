'use node'

import { internalAction, internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const generatePDF = internalAction({
  args: { data: v.any() },
  async handler(_, args) {
    console.log(args.data)
  },
})

export const store_file = internalMutation({
  args: {
    storageId: v.id('_storage'),
    url: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert('files', args)
  },
})
