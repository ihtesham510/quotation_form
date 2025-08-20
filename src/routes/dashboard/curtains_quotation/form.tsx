import { BlindQuotationForm as CurtainsForm } from '@/components/curtains_form'
import { generateQuotePDF } from '@/components/curtains_form/pdf'
import type { SelfContainedQuoteData } from '@/components/curtains_form/types'
import { LoaderComponent } from '@/components/loader-component'
import { useAuth } from '@/context/auth'
import { openPdf } from '@/lib/pdf'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import { useAction, useMutation } from 'convex/react'
import React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/dashboard/curtains_quotation/form')({
	component: RouteComponent,
})

function RouteComponent() {
	const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
	const [emailRecipient, setEmailRecipient] = useState('')
	const [quoteDataToEmail, setQuoteDataToEmail] =
		useState<SelfContainedQuoteData | null>(null)
	const { user } = useAuth()
	const sendEmailAction = useAction(api.node_functions.sendEmail)
	const saveQuote = useMutation(api.quotation.addCurtainQuotation)
	const productDatabase = useQuery(
		api.product_categoreis.getProductAndCategories,
		{
			userId: user ? user._id : undefined,
		},
	)
	const handleEmail = (data: SelfContainedQuoteData) => {
		setQuoteDataToEmail(data)
		setEmailRecipient(data.customer.email)
		setIsEmailDialogOpen(true)
	}
	const sendEmail = async () => {
		if (quoteDataToEmail && emailRecipient) {
			toast.promise(
				async () =>
					await sendEmailAction({
						quoteData: quoteDataToEmail,
						email: emailRecipient,
					}),
				{
					loading: 'Sending Email',
					success: 'Email Sent, check you Inbox.',
					error: 'Error while sending email.',
				},
			)
			setIsEmailDialogOpen(false)
			setEmailRecipient('')
			setQuoteDataToEmail(null)
		} else {
			alert('Please enter a valid email address.')
		}
	}

	if (!productDatabase) return <LoaderComponent />
	return (
		<React.Fragment>
			<Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Email Quote</DialogTitle>
						<DialogDescription>
							Enter the recipient's email address to send the quote.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='space-y-2'>
							<Label htmlFor='emailRecipient'>Recipient Email</Label>
							<Input
								id='emailRecipient'
								type='email'
								value={emailRecipient}
								onChange={e => setEmailRecipient(e.target.value)}
								placeholder='email@example.com'
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsEmailDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={sendEmail}>Send Email</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<div className='grid space-y-4'>
				<div>
					<h1 className='title'>Curtains Form</h1>
					<p className='description'>
						Create your custom curtain quotation in just a few steps. Enter your
						details, calculate the cost, and download your personalized quote as
						a PDF instantly.
					</p>
				</div>

				<CurtainsForm
					productDatabase={productDatabase}
					onGeneratePDF={async data => {
						const blob = await generateQuotePDF(data)
						return openPdf(blob)
					}}
					onSaveQuote={async data => {
						if (user) {
							toast.promise(
								async () =>
									await saveQuote({
										userId: user._id,
										...data,
									}),
								{
									success: 'Quote Saved Successfully',
									error: 'Error while saving quote.',
								},
							)
						}
					}}
					onEmail={handleEmail}
				/>
			</div>
		</React.Fragment>
	)
}
