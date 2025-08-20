import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/tile_quotation/')({
	component: () => <Navigate to='/dashboard/tile_quotation/form' />,
})
