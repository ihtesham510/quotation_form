'use node'

import { internal } from './_generated/api'
import { internalAction, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { generatePDFQuote } from '../src/lib/pdf'
import type { QuoteData } from './pdf_generate_schema'

export const generatePDF = internalAction({
  args: { data: v.any() },
  async handler(ctx, args) {
    const data: QuoteData = args.data
    const blob = await generatePDFQuote(data)
    const id = await ctx.storage.store(blob)
    const url = await ctx.storage.getUrl(id)
    if (url && id) {
      await ctx.runMutation(internal.pdf.store_file, { storageId: id, url })
      return url
    }
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
