import { createFileRoute } from '@tanstack/react-router'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import { LoaderComponent } from '@/components/loader-component'
import { useAuth } from '@/context/auth'

export const Route = createFileRoute('/dashboard/history/$quotationId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { quotationId } = Route.useParams()
	const quotation = useQuery(api.quotation.getQuotation, {
		quotationId: quotationId as Id<'quotation'>,
	})
	return <div>{quotation && <QuotationDetails quotation={quotation} />}</div>
}

function QuotationDetails({}: {
	quotation: DataModel['quotation']['document'] & {
		title?: string
		description?: string
	}
}) {
	const { user } = useAuth()
	const productDatabase = useQuery(
		api.product_categoreis.getProductAndCategories,
		{
			userId: user ? user._id : undefined,
		},
	)
	if (!productDatabase) return <LoaderComponent />
	return <div>Working on updating the Database schema</div>
}
