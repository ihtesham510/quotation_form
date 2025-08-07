import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { UnProtectedRoute } from '@/hoc/unprotected-routes'

export const Route = createFileRoute('/')({
	component: () => (
		<UnProtectedRoute>
			<App />
		</UnProtectedRoute>
	),
})

function App() {
	return (
		<div className='h-screen w-full flex justify-center items-center'>
			<Link to='/sign-in'>
				<Button>Sign In</Button>
			</Link>
		</div>
	)
}
