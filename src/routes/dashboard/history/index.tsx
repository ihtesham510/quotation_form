import { createFileRoute, Link } from '@tanstack/react-router'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Eye, Download, FileText } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useAuth } from '@/context/auth'
import React from 'react'
import { LoaderComponent } from '@/components/loader-component'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { generateQuotePDF } from '@/components/curtains_form/pdf'
import { openPdf } from '@/lib/pdf'

export const Route = createFileRoute('/dashboard/history/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useAuth()
	return <div>{user && <History userId={user._id} />}</div>
}

function History({ userId }: { userId: Id<'user'> }) {
	const quotations = useQuery(api.quotation.getQuotations, { userId })

	const isEmpty = quotations && quotations.length === 0
	if (!quotations) return <LoaderComponent />
	return (
		<React.Fragment>
			{isEmpty && <RenderEmptyQuotations />}
			{!isEmpty && <RenderQuotations mockQuotations={quotations} />}
		</React.Fragment>
	)
}

function RenderEmptyQuotations() {
	return (
		<div className='flex flex-col items-center justify-center py-20 text-center'>
			<FileText className='h-16 w-16 text-muted-foreground mb-4' />
			<h2 className='text-2xl font-bold mb-2'>No Quotations Found</h2>
			<p className='text-muted-foreground mb-6 max-w-md'>
				It looks like you haven't created any curtain quotations yet. Get
				started by creating your first one!
			</p>
			<Link to='/dashboard/form'>
				<Button>
					<FileText className='mr-2 h-4 w-4' />
					Create New Quotation
				</Button>
			</Link>
		</div>
	)
}

function RenderQuotations({
	mockQuotations,
}: {
	mockQuotations: DataModel['quotation']['document'][]
}) {
	return (
		<main className='container mx-auto py-8'>
			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
				<h1 className='text-2xl sm:text-3xl font-bold'>Curtains Quotations</h1>
				<Link to='/dashboard/form'>
					<Button className='w-full sm:w-auto'>
						<FileText className='mr-2 h-4 w-4' />
						New Quotation
					</Button>
				</Link>
			</div>

			<div className='hidden md:block'>
				<div className='rounded-md border overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Quote ID</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Saved</TableHead>
								<TableHead>Quote Date</TableHead>
								<TableHead>Items</TableHead>
								<TableHead className='text-right'>Grand Total</TableHead>
								<TableHead className='text-center'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{mockQuotations.map(q => {
								const itemCount =
									q.products.length + q.addOns.length + q.customServices.length
								return (
									<TableRow key={q.id}>
										<TableCell className='font-medium'>{q.id}</TableCell>
										<TableCell>{q.customer.name}</TableCell>
										<TableCell>{formatDate(q.savedAt)}</TableCell>
										<TableCell>{formatDate(q.quoteDate)}</TableCell>
										<TableCell>{itemCount}</TableCell>
										<TableCell className='text-right'>
											{formatCurrency(q.pricing.grandTotal)}
										</TableCell>
										<TableCell>
											<div className='flex justify-center gap-2'>
												<Link
													to='/dashboard/history/$quotationId'
													params={{ quotationId: q._id }}
												>
													<Button size='sm' variant='outline'>
														<Eye className='h-4 w-4' />
														<span className='sr-only'>Preview</span>
													</Button>
												</Link>

												<Button
													size='sm'
													variant='outline'
													onClick={async () => {
														const blob = await generateQuotePDF(q)
														openPdf(blob)
													}}
												>
													<Download className='h-4 w-4' />
													<span className='sr-only'>Download PDF</span>
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Mobile cards */}
			<div className='grid md:hidden gap-4'>
				{mockQuotations.map(q => {
					const itemCount =
						q.products.length + q.addOns.length + q.customServices.length
					return (
						<Card key={q.id} className='border'>
							<CardContent className='p-4'>
								<div className='flex items-start justify-between gap-4'>
									<div>
										<div className='text-sm text-muted-foreground'>{q.id}</div>
										<div className='font-semibold'>{q.customer.name}</div>
										<div className='text-sm text-muted-foreground mt-1'>
											Saved: {formatDate(q.savedAt)} • Quote:{' '}
											{formatDate(q.quoteDate)}
										</div>
										<div className='text-sm mt-1'>Items: {itemCount}</div>
										<div className='text-lg font-bold mt-2'>
											{formatCurrency(q.pricing.grandTotal)}
										</div>
									</div>
									<div className='flex flex-col gap-2'>
										<Link
											to='/dashboard/history/$quotationId'
											params={{ quotationId: q._id }}
										>
											<Button
												size='sm'
												variant='outline'
												className='w-full bg-transparent'
											>
												<Eye className='h-4 w-4' />
											</Button>
										</Link>

										<Button
											size='sm'
											variant='outline'
											className='w-full bg-transparent'
											onClick={async () => {
												const blob = await generateQuotePDF(q)
												openPdf(blob)
											}}
										>
											<Download className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</main>
	)
}
