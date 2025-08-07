import { CurtainsForm } from '@/components/curtains_form'
import { generateQuotePDF } from '@/components/curtains_form/pdf'
import { LoaderComponent } from '@/components/loader-component'
import { useAuth } from '@/context/auth'
import { openPdf } from '@/lib/pdf'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/form')({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useAuth()
	const saveQuote = useMutation(api.quotation.addCurtainQuotation)
	const productDatabase = useQuery(
		api.product_categoreis.getProductAndCategories,
		{
			userId: user ? user._id : undefined,
		},
	)
	if (!productDatabase) return <LoaderComponent />
	return (
		<div className='grid space-y-4'>
			<div>
				<h1 className='title'>Curtains Form</h1>
				<p className='description'>
					Create your custom curtain quotation in just a few steps. Enter your
					details, calculate the cost, and download your personalized quote as a
					PDF instantly.
				</p>
			</div>

			<CurtainsForm
				productDatabase={productDatabase}
				onGeneratePDF={async data => {
					const blob = await generateQuotePDF(data, productDatabase)
					return openPdf(blob)
				}}
				onSaveQuote={async data => {
					if (user) {
						await saveQuote({ userId: user._id, ...data })
						toast.success('Quotation Saved Successfully')
					}
				}}
			/>
		</div>
	)
}
