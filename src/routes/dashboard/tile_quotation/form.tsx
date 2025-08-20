import { LoaderComponent } from '@/components/loader-component'
import { TileQuotation } from '@/components/tile_form'
import { generateTileQuotePDF } from '@/components/tile_form/pdf'
import type { QuotationData } from '@/components/tile_form/types'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth'
import { openPdf } from '@/lib/pdf'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useAction, useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/tile_quotation/form')({
	component: () => {
		const { user } = useAuth()
		if (!user) {
			return null
		}
		return <Form userId={user._id} />
	},
})

function Form({ userId }: { userId: Id<'user'> }) {
	const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
	const [emailRecipient, setEmailRecipient] = useState('')
	const [quoteData, setQuoteData] = useState<QuotationData | null>(null)
	const tileData = useQuery(api.tile_materials.getTileData, { userId })
	const saveQuotation = useMutation(api.quotation.addTileQuotation)
	const sendEmailQuotation = useAction(api.node_functions.sendTileQuotationEmail)
	if (!tileData) {
		return <LoaderComponent />
	}
	const { finish, ...data } = tileData
	const handleSendEmail = () => {
		if (quoteData) {
			setIsEmailDialogOpen(false)
			toast.promise(
				async () =>
					await sendEmailQuotation({
						email: emailRecipient,
						quoteData: quoteData,
					}),
				{
					loading: 'Sending Email',
					error: 'Error while sending email',
					success: 'Email Sent, Check your inbox',
				},
			)
			setQuoteData(null)
			setEmailRecipient('')
		}
	}
	return (
		<div>
			<Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Email Quote</DialogTitle>
						<DialogDescription>Enter the recipient's email address to send the quote.</DialogDescription>
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
						<Button variant='outline' onClick={() => setIsEmailDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSendEmail}>Send Email</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<TileQuotation
				tileData={{ finishes: finish, ...data }}
				onEmail={data => {
					setQuoteData(data)
					setIsEmailDialogOpen(true)
				}}
				onSave={async data => {
					await saveQuotation({ userId, ...data })
					toast.success('Quotation saved Successfully')
				}}
				onGeneratePDF={async data => {
					const blob = await generateTileQuotePDF(data)
					openPdf(blob)
				}}
			/>
		</div>
	)
}
