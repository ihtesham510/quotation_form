import type { AuthContext } from '@/context/auth'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<AuthContext>()({
  component: () => <Outlet />,
})
