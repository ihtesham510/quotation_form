import { createFileRoute, Link } from '@tanstack/react-router'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { generateQuotePDF } from '@/components/curtains_form/pdf'
import { openPdf } from '@/lib/pdf'

export const Route = createFileRoute('/dashboard/history/$quotationId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { quotationId } = Route.useParams()
	const quotation = useQuery(api.quotation.getQuotation, {
		quotationId: quotationId as Id<'quotation'>,
	})
	return <div>{quotation && <QuotationDetails q={quotation} />}</div>
}

function QuotationDetails({ q }: { q: DataModel['quotation']['document'] }) {
	return (
		<main className='container mx-auto py-8'>
			<div className='flex flex-col gap-6'>
				<div className='flex items-center justify-between gap-4'>
					<Link to='/dashboard/history'>
						<Button
							variant='outline'
							className='w-full sm:w-auto bg-transparent'
						>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Back to Quotations
						</Button>
					</Link>

					<Button
						variant='outline'
						onClick={async () => {
							const blob = await generateQuotePDF(q)
							openPdf(blob)
						}}
					>
						<Download className='md:mr-2 h-4 w-4' />
						<p className='hidden md:inline-flex'>Download PDF</p>
					</Button>
				</div>

				{/* Header */}
				<div className='flex flex-col md:flex-row justify-between gap-4'>
					<div>
						<h1 className='text-2xl md:text-3xl font-bold'>
							Curtains Quotation
						</h1>
						<p className='text-muted-foreground'>Quote ID: {q.id}</p>
					</div>
					<div className='text-left md:text-right'>
						<p className='text-muted-foreground'>
							Quote Date: {formatDate(q.quoteDate)}
						</p>
					</div>
				</div>

				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle>Customer Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<h3 className='font-semibold'>Contact</h3>
								<p>{q.customer.name}</p>
								<p>{q.customer.email}</p>
								<p>{q.customer.phone}</p>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-muted-foreground'>
										Billing Address
									</p>
									<p>{q.customer.address}</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										Project Address
									</p>
									<p>{q.customer.projectAddress}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Products */}
				<Card>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle>Products</CardTitle>
							<Badge variant='outline'>{q.products.length} items</Badge>
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
									{q.products.map(p => (
										<TableRow key={p.id}>
											<TableCell className='font-medium'>
												{p.name}
												<div className='text-xs text-muted-foreground'>
													{p.label}
												</div>
											</TableCell>
											<TableCell className='min-w-[180px]'>
												<div className='text-sm'>{p.categoryName}</div>
												<div className='text-xs text-muted-foreground'>
													{p.color} • {p.controlType}
												</div>
												{p.specialFeatures && (
													<div className='text-xs text-muted-foreground'>
														{p.specialFeatures}
													</div>
												)}
												<div className='text-xs'>
													{p.installation
														? 'Installation included'
														: 'No installation'}
												</div>
											</TableCell>
											<TableCell>
												{p.width}m × {p.height}m
											</TableCell>
											<TableCell className='uppercase'>{p.priceType}</TableCell>
											<TableCell>{p.quantity}</TableCell>
											<TableCell className='text-right'>
												{formatCurrency(p.effectivePrice)}
											</TableCell>
											<TableCell className='text-right'>
												{formatCurrency(p.total)}
											</TableCell>
											<TableCell className='text-right'>
												{formatCurrency(p.gstAmount)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Mobile stacked list for products */}
						<div className='md:hidden mt-4 space-y-3'>
							{q.products.map(p => (
								<div key={p.id} className='rounded-md border p-3'>
									<div className='flex justify-between'>
										<div className='font-medium'>{p.name}</div>
										<div className='text-right font-semibold'>
											{formatCurrency(p.total)}
										</div>
									</div>
									<div className='text-xs text-muted-foreground'>
										{p.label} • {p.categoryName}
									</div>
									<div className='text-sm mt-1'>
										{p.width}m × {p.height}m • {p.priceType.toUpperCase()} • Qty{' '}
										{p.quantity}
									</div>
									<div className='text-xs text-muted-foreground'>
										{p.color} • {p.controlType} • GST{' '}
										{formatCurrency(p.gstAmount)}
									</div>
									{p.specialFeatures && (
										<div className='text-xs text-muted-foreground'>
											{p.specialFeatures}
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Add-ons */}
				{q.addOns.length > 0 && (
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<CardTitle>Add-ons</CardTitle>
								<Badge variant='outline'>{q.addOns.length} items</Badge>
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
										{q.addOns.map(a => (
											<TableRow key={a.id}>
												<TableCell className='font-medium'>{a.name}</TableCell>
												<TableCell className='min-w-[220px]'>
													{a.description}
												</TableCell>
												<TableCell className='uppercase'>
													{a.unitType}
													{a.length ? ` • ${a.length}m` : ''}
												</TableCell>
												<TableCell>{a.quantity}</TableCell>
												<TableCell className='text-right'>
													{formatCurrency(a.unitPrice)}
												</TableCell>
												<TableCell className='text-right'>
													{formatCurrency(a.total)}
												</TableCell>
												<TableCell className='text-right'>
													{formatCurrency(a.gstAmount)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Mobile stacked list for add-ons */}
							<div className='md:hidden mt-4 space-y-3'>
								{q.addOns.map(a => (
									<div key={a.id} className='rounded-md border p-3'>
										<div className='flex justify-between'>
											<div className='font-medium'>{a.name}</div>
											<div className='text-right font-semibold'>
												{formatCurrency(a.total)}
											</div>
										</div>
										<div className='text-xs text-muted-foreground'>
											{a.description}
										</div>
										<div className='text-sm mt-1'>
											Unit {a.unitType.toUpperCase()} • Qty {a.quantity} • GST{' '}
											{formatCurrency(a.gstAmount)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Custom Services */}
				{q.customServices.length > 0 && (
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<CardTitle>Custom Services</CardTitle>
								<Badge variant='outline'>{q.customServices.length} items</Badge>
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
										{q.customServices.map(s => (
											<TableRow key={s.id}>
												<TableCell className='font-medium'>{s.name}</TableCell>
												<TableCell className='min-w-[220px]'>
													{s.description}
												</TableCell>
												<TableCell className='text-right'>
													{formatCurrency(s.total)}
												</TableCell>
												<TableCell className='text-right'>
													{formatCurrency(s.gstAmount)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Mobile stacked list for services */}
							<div className='md:hidden mt-4 space-y-3'>
								{q.customServices.map(s => (
									<div key={s.id} className='rounded-md border p-3'>
										<div className='flex justify-between'>
											<div className='font-medium'>{s.name}</div>
											<div className='text-right font-semibold'>
												{formatCurrency(s.total)}
											</div>
										</div>
										<div className='text-xs text-muted-foreground'>
											{s.description}
										</div>
										<div className='text-xs text-muted-foreground'>
											GST {formatCurrency(s.gstAmount)}
										</div>
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
											q.pricing.subtotalBeforeMarkupAndDiscount +
												q.pricing.totalMarkup,
										)}
									</span>
								</div>
								<div className='grid grid-cols-2'>
									<span>
										Discount{' '}
										{q.pricing.discountType === 'percentage'
											? `(${q.pricing.discountValue}%)`
											: '(Fixed)'}
									</span>
									<span className='text-right text-red-500'>
										-{formatCurrency(q.pricing.discountAmount)}
									</span>
								</div>
								{q.pricing.discountReason && (
									<div className='text-xs text-muted-foreground'>
										Reason: {q.pricing.discountReason}
									</div>
								)}
								<Separator className='my-2' />
								<div className='grid grid-cols-2'>
									<span>
										GST {q.pricing.gstEnabled ? `(${q.pricing.gstRate}%)` : ''}
									</span>
									<span className='text-right'>
										{formatCurrency(q.pricing.totalGST)}
									</span>
								</div>
								<Separator className='my-2' />
								<div className='grid grid-cols-2 text-lg font-bold'>
									<span>Grand Total</span>
									<span className='text-right'>
										{formatCurrency(q.pricing.grandTotal)}
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
