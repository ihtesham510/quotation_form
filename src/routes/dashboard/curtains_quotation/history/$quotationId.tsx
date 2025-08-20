import { createFileRoute, Link } from '@tanstack/react-router'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, SendIcon } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { generateQuotePDF } from '@/components/curtains_form/pdf'
import { openPdf } from '@/lib/pdf'
import { useAction } from 'convex/react'
import { toast } from 'sonner'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import React from 'react'

type Quote = Omit<DataModel['quotation']['document'], '_id' | '_creationTime' | 'userId'>

export const Route = createFileRoute('/dashboard/curtains_quotation/history/$quotationId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { quotationId } = Route.useParams()
	const quotation = useQuery(api.quotation.getQuotation, {
		quotationId: quotationId as Id<'quotation'>,
	})
	const sendEmailAction = useAction(api.node_functions.sendEmail)
	return (
		<div>
			{quotation && (
				<QuotationDetails
					quotation={quotation}
					onSendEmail={quoteData => {
						toast.promise(
							async () => {
								await sendEmailAction({
									quoteData,
									email: 'ihteshamulhaq510@gmail.com',
								})
							},
							{
								loading: 'Sending Email',
								success: 'Email Sent, Check your Inbox',
								error: 'Error while sending email',
							},
						)
					}}
				/>
			)}
		</div>
	)
}

function QuotationDetails({
	quotation,
	onSendEmail,
}: {
	quotation: DataModel['quotation']['document']
	onSendEmail: (quote: Quote) => Promise<void> | void
}) {
	const [open, setIsOpen] = useState(false)
	return (
		<React.Fragment>
			<main className='container mx-auto py-8'>
				<SendEmailDialog
					open={open}
					onOpenChange={e => setIsOpen(e)}
					defaultValue={quotation.customer.email}
					onSendEmail={async () => {
						let quotationData = { ...quotation }
						const propsToDelete = ['_id', '_creationTime', 'userId'] as const
						propsToDelete.forEach(prop => delete (quotationData as any)[prop])
						await onSendEmail(quotationData)
						setIsOpen(false)
					}}
				/>
				<div className='flex flex-col gap-6'>
					<div className='flex flex-col md:flex-row items-center justify-between gap-6'>
						<Link to='/dashboard/curtains_quotation/history'>
							<Button variant='outline' className='w-full sm:w-auto bg-transparent'>
								<ArrowLeft className='mr-2 h-4 w-4' />
								Back to Quotations
							</Button>
						</Link>

						<div className='flex flex-col w-full md:w-max md:flex-row gap-2'>
							<Button
								variant='outline'
								onClick={async () => {
									const blob = await generateQuotePDF(quotation)
									openPdf(blob)
								}}
							>
								<Download className='md:mr-2 h-4 w-4' />
								Download PDF
							</Button>
							<Button variant='outline' onClick={() => setIsOpen(true)}>
								<SendIcon className='md:mr-2 h-4 w-4' />
								Send Email
							</Button>
						</div>
					</div>

					{/* Header */}
					<div className='flex flex-col md:flex-row justify-between gap-4'>
						<div>
							<h1 className='text-2xl md:text-3xl font-bold'>Curtains Quotation</h1>
							<p className='text-muted-foreground'>Quote ID: {quotation.id}</p>
						</div>
						<div className='text-left md:text-right'>
							<p className='text-muted-foreground'>Quote Date: {formatDate(quotation.quoteDate)}</p>
						</div>
					</div>
					<Card>
						<CardHeader>
							<CardTitle>Customer Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<h3 className='font-semibold'>Contact</h3>
									<p>{quotation.customer.name}</p>
									<p>{quotation.customer.email}</p>
									<p>{quotation.customer.phone}</p>
								</div>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>Billing Address</p>
										<p>{quotation.customer.address}</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>Project Address</p>
										<p>{quotation.customer.projectAddress}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<CardTitle>Products</CardTitle>
								<Badge variant='outline'>{quotation.products.length} items</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Product</TableHead>
											<TableHead>Details</TableHead>
											<TableHead>Dimensions</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Qty</TableHead>
											<TableHead className='text-right'>Eff. Price</TableHead>
											<TableHead className='text-right'>Total</TableHead>
											<TableHead className='text-right'>GST</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{quotation.products.map(p => (
											<TableRow key={p.id}>
												<TableCell className='font-medium'>
													{p.name}
													<div className='text-xs text-muted-foreground'>{p.label}</div>
												</TableCell>
												<TableCell className='min-w-[180px]'>
													<div className='text-sm'>{p.categoryName}</div>
													<div className='text-xs text-muted-foreground'>
														{p.color} • {p.controlType}
													</div>
													{p.specialFeatures && (
														<div className='text-xs text-muted-foreground'>{p.specialFeatures}</div>
													)}
													<div className='text-xs'>{p.installation ? 'Installation included' : 'No installation'}</div>
												</TableCell>
												<TableCell>
													{p.width}m × {p.height}m
												</TableCell>
												<TableCell className='uppercase'>{p.priceType}</TableCell>
												<TableCell>{p.quantity}</TableCell>
												<TableCell className='text-right'>{formatCurrency(p.effectivePrice)}</TableCell>
												<TableCell className='text-right'>{formatCurrency(p.total)}</TableCell>
												<TableCell className='text-right'>{formatCurrency(p.gstAmount)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							<div className='md:hidden mt-4 space-y-3'>
								{quotation.products.map(p => (
									<div key={p.id} className='rounded-md border p-3'>
										<div className='flex justify-between'>
											<div className='font-medium'>{p.name}</div>
											<div className='text-right font-semibold'>{formatCurrency(p.total)}</div>
										</div>
										<div className='text-xs text-muted-foreground'>
											{p.label} • {p.categoryName}
										</div>
										<div className='text-sm mt-1'>
											{p.width}m × {p.height}m • {p.priceType.toUpperCase()} • Qty {p.quantity}
										</div>
										<div className='text-xs text-muted-foreground'>
											{p.color} • {p.controlType} • GST {formatCurrency(p.gstAmount)}
										</div>
										{p.specialFeatures && <div className='text-xs text-muted-foreground'>{p.specialFeatures}</div>}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
					{quotation.addOns.length > 0 && (
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<CardTitle>Add-ons</CardTitle>
									<Badge variant='outline'>{quotation.addOns.length} items</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Service</TableHead>
												<TableHead>Description</TableHead>
												<TableHead>Unit</TableHead>
												<TableHead>Qty</TableHead>
												<TableHead className='text-right'>Unit Price</TableHead>
												<TableHead className='text-right'>Total</TableHead>
												<TableHead className='text-right'>GST</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{quotation.addOns.map(a => (
												<TableRow key={a.id}>
													<TableCell className='font-medium'>{a.name}</TableCell>
													<TableCell className='min-w-[220px]'>{a.description}</TableCell>
													<TableCell className='uppercase'>
														{a.unitType}
														{a.length ? ' • ${a.length}m' : ''}
													</TableCell>
													<TableCell>{a.quantity}</TableCell>
													<TableCell className='text-right'>{formatCurrency(a.unitPrice)}</TableCell>
													<TableCell className='text-right'>{formatCurrency(a.total)}</TableCell>
													<TableCell className='text-right'>{formatCurrency(a.gstAmount)}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								<div className='md:hidden mt-4 space-y-3'>
									{quotation.addOns.map(a => (
										<div key={a.id} className='rounded-md border p-3'>
											<div className='flex justify-between'>
												<div className='font-medium'>{a.name}</div>
												<div className='text-right font-semibold'>{formatCurrency(a.total)}</div>
											</div>
											<div className='text-xs text-muted-foreground'>{a.description}</div>
											<div className='text-sm mt-1'>
												Unit {a.unitType.toUpperCase()} • Qty {a.quantity} • GST {formatCurrency(a.gstAmount)}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{quotation.customServices.length > 0 && (
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<CardTitle>Custom Services</CardTitle>
									<Badge variant='outline'>{quotation.customServices.length} items</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Service</TableHead>
												<TableHead>Description</TableHead>
												<TableHead className='text-right'>Price</TableHead>
												<TableHead className='text-right'>GST</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{quotation.customServices.map(s => (
												<TableRow key={s.id}>
													<TableCell className='font-medium'>{s.name}</TableCell>
													<TableCell className='min-w-[220px]'>{s.description}</TableCell>
													<TableCell className='text-right'>{formatCurrency(s.total)}</TableCell>
													<TableCell className='text-right'>{formatCurrency(s.gstAmount)}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								<div className='md:hidden mt-4 space-y-3'>
									{quotation.customServices.map(s => (
										<div key={s.id} className='rounded-md border p-3'>
											<div className='flex justify-between'>
												<div className='font-medium'>{s.name}</div>
												<div className='text-right font-semibold'>{formatCurrency(s.total)}</div>
											</div>
											<div className='text-xs text-muted-foreground'>{s.description}</div>
											<div className='text-xs text-muted-foreground'>GST {formatCurrency(s.gstAmount)}</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 space-y-4'>
								<div className='space-y-2'>
									<div className='grid grid-cols-2'>
										<span>Subtotal</span>
										<span className='text-right'>
											{formatCurrency(
												quotation.pricing.subtotalBeforeMarkupAndDiscount + quotation.pricing.totalMarkup,
											)}
										</span>
									</div>
									<div className='grid grid-cols-2'>
										<span>
											Discount{' '}
											{quotation.pricing.discountType === 'percentage'
												? `(${quotation.pricing.discountValue}%)`
												: '(Fixed)'}
										</span>
										<span className='text-right text-red-500'>-{formatCurrency(quotation.pricing.discountAmount)}</span>
									</div>
									{quotation.pricing.discountReason && (
										<div className='text-xs text-muted-foreground'>Reason: {quotation.pricing.discountReason}</div>
									)}
									<Separator className='my-2' />
									<div className='grid grid-cols-2'>
										<span>GST {quotation.pricing.gstEnabled ? '(${quotation.pricing.gstRate}%)' : ''}</span>
										<span className='text-right'>{formatCurrency(quotation.pricing.totalGST)}</span>
									</div>
									<Separator className='my-2' />
									<div className='grid grid-cols-2 text-lg font-bold'>
										<span>Grand Total</span>
										<span className='text-right'>{formatCurrency(quotation.pricing.grandTotal)}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</React.Fragment>
	)
}

function SendEmailDialog({
	open,
	onOpenChange,
	onSendEmail,
	defaultValue,
}: {
	open: boolean
	onOpenChange: (e: boolean) => void
	defaultValue?: string
	onSendEmail: (email: string) => void
}) {
	const [emailRecipient, setEmailRecipient] = useState(defaultValue ?? '')
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
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
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={() => onSendEmail(emailRecipient)}>Send Email</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
