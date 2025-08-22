import { ChatBot } from '@/components/chat-bot'
import { ProtectedRoute } from '@/hoc/protected-routes'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
	component: () => (
		<ProtectedRoute>
			<ChatBot />
			<Outlet />
		</ProtectedRoute>
	),
})
