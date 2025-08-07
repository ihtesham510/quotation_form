import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useAuth } from '@/context/auth'
import React from 'react'

export const Route = createFileRoute('/dashboard/history/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useAuth()
	return <div>{user && <History userId={user._id} />}</div>
}

function History({ userId }: { userId: Id<'user'> }) {
	// const { user } = useAuth()
	const quotations = useQuery(api.quotation.getQuotations, { userId })
	// const productDatabase = useQuery(
	// 	api.product_categoreis.getProductAndCategories,
	// 	{
	// 		userId: user ? user._id : undefined,
	// 	},
	// )

	// const isEmpty = quotations && quotations.length === 0
	if (!quotations) return null
	return <React.Fragment>Updating the Database schema</React.Fragment>
}
