import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/curtains_quotation/')({
	component: () => <Navigate to='/dashboard/curtains_quotation/form' />,
})
