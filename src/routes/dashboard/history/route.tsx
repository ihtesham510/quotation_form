import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/history')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-2 md:px-6 mb-8">
      <Outlet />
    </div>
  )
}
