import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  files: defineTable({
    url: v.string(),
    storageId: v.id('_storage'),
  }),
  user: defineTable({
    first_name: v.string(),
    last_name: v.string(),
    email: v.string(),
    password: v.string(),
  }).index('by_email', ['email']),
  forms: defineTable({
    userId: v.id('user'),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal('tile'), v.literal('curtains')),
  }).index('by_userId', ['userId']),
})
