import { LoaderComponent } from '@/components/loader-component'
import { useAuth } from '@/context/auth'
import { Navigate } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

export function ProtectedRoute({ children }: PropsWithChildren) {
	const { isLoading, isAuthenticated } = useAuth()
	if (isLoading) return <LoaderComponent />
	if (!isLoading && !isAuthenticated) return <Navigate to='/sign-in' />
	return children
}
