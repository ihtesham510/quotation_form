import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/forms/tile_form')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/forms/tile_form"!</div>
}
