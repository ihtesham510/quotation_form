import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  files: defineTable({
    url: v.string(),
    storageId: v.id('_storage'),
  }),
})
