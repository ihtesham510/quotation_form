'use node'

import { internalAction } from './_generated/server'
import { v } from 'convex/values'

export const generatePDF = internalAction({
  args: { data: v.any() },
  async handler(_, args) {
    console.log(args.data)
  },
})
