import type { AuthContext } from '@/context/auth'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { ConvexReactClient } from 'convex/react'

export const Route = createRootRouteWithContext<{
  auth: AuthContext
  convex: ConvexReactClient
  api: typeof api
}>()({
  component: () => <Outlet />,
})
