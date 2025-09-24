import type { MaterialItem, QuotationData } from '@/components/tile_form/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex-helpers/react/cache'
import { Badge } from '@/components/ui/badge'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { ArrowLeft, Download, Mail, User, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import { LoaderComponent } from '@/components/loader-component'
import { generateTileQuotePDF } from '@/components/tile_form/pdf'
import { openPdf } from '@/lib/pdf'
import { useAction } from 'convex/react'
import { toast } from 'sonner'
import { filterQuotationData } from '@/components/tile_form/utils'

export const Route = createFileRoute('/dashboard/tile_quotation/history/$quotationId')({
	component: RouteComponent,
})

function RouteComponent() {
	const { quotationId } = Route.useParams()
	const sendTileQuotationEmail = useAction(api.node_functions.sendTileQuotationEmail)
	const quotation = useQuery(api.quotation.getTileQuotation, { tile_quotation_id: quotationId as Id<'tile_quotation'> })
	if (!quotation) return <LoaderComponent />
	return (
		<RenderQuotation
			quotation={{
				customerInfo: quotation.customerInfo,
				pricingOptions: quotation.pricingOptions,
				pricing: quotation.pricing,
				selections: {
					materialItems: quotation.selections.materialItems as MaterialItem[],
				},
				addOns: quotation.addOns,
			}}
			onSendEmail={email => {
				toast.promise(
					async () => {
						await sendTileQuotationEmail({
							email,
							quoteData: filterQuotationData({
								customerInfo: quotation.customerInfo,
								pricingOptions: quotation.pricingOptions,
								pricing: quotation.pricing,
								selections: {
									materialItems: quotation.selections.materialItems as MaterialItem[],
								},
								addOns: quotation.addOns,
							}),
						})
					},
					{
						loading: 'Sending Email',
						success: 'Email Sent, Check your inbox.',
						error: 'Error while sending email',
					},
				)
			}}
			onDownloadPdf={async () => {
				const blob = await generateTileQuotePDF({
					customerInfo: quotation.customerInfo,
					pricingOptions: quotation.pricingOptions,
					pricing: quotation.pricing,
					selections: {
						materialItems: quotation.selections.materialItems as MaterialItem[],
					},
					addOns: quotation.addOns,
				})
				openPdf(blob)
			}}
		/>
	)
}

function RenderQuotation({
	quotation,
	onSendEmail,
	onDownloadPdf,
}: {
	quotation: QuotationData
	onSendEmail: (email: string) => void
	onDownloadPdf: () => void
}) {
	const [emailDialogOpen, setEmailDialogOpen] = useState(false)
	const [emailData, setEmailData] = useState({
		to: quotation.customerInfo.email,
	})

	const handleDownloadPDF = () => {
		onDownloadPdf()
	}

	const handleSendEmail = () => {
		onSendEmail(emailData.to)
		setEmailDialogOpen(false)
	}

	// Helper function to format size information for display
	const formatSizeDisplay = (item: MaterialItem) => {
		if (!item.size) return 'N/A'

		const sizeData = item.size.size
		switch (sizeData.type) {
			case 'linear_meter':
				return `${item.size.name} (Linear Meter)`
			case 'height_width':
				return `${item.size.name} (${sizeData.height}" × ${sizeData.width}")`
			case 'custom':
				return `${item.size.name} (Custom)`
			default:
				return item.size.name
		}
	}

	// Helper function to get appropriate unit display
	const getUnitDisplay = (item: MaterialItem) => {
		if (!item.size) return 'units'

		const sizeData = item.size.size
		switch (sizeData.type) {
			case 'linear_meter':
				return 'linear meters'
			case 'height_width':
				return 'sq ft'
			case 'custom':
				return 'units'
			default:
				return 'units'
		}
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto py-8'>
				<div className='mx-auto'>
					{/* Header */}

					<h1 className='text-3xl font-bold text-foreground mb-6'>Quotation Preview</h1>
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center gap-4'>
							<Link to='/dashboard/tile_quotation/history'>
								<Button variant='outline' size='sm'>
									<ArrowLeft className='h-4 w-4 mr-2' />
									Back to Quotations
								</Button>
							</Link>
						</div>
						<div className='flex gap-2'>
							<Button onClick={handleDownloadPDF} variant='outline'>
								<Download className='h-4 w-4 mr-2' />
								Download PDF
							</Button>
							<Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
								<DialogTrigger asChild>
									<Button>
										<Mail className='h-4 w-4 mr-2' />
										Send Email
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-md'>
									<DialogHeader>
										<DialogTitle>Send Quotation via Email</DialogTitle>
										<DialogDescription>Enter the email address to send this quotation.</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='email-to'>Email Address</Label>
											<Input
												id='email-to'
												type='email'
												value={emailData.to}
												onChange={e => setEmailData({ to: e.target.value })}
												placeholder='customer@example.com'
											/>
										</div>
									</div>
									<DialogFooter>
										<Button variant='outline' onClick={() => setEmailDialogOpen(false)}>
											Cancel
										</Button>
										<Button onClick={handleSendEmail}>Send Email</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					{/* Customer Information */}
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<User className='h-5 w-5' />
								Customer Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<div className='flex items-center gap-2'>
										<User className='h-4 w-4 text-muted-foreground' />
										<span className='font-medium'>{quotation.customerInfo.name}</span>
									</div>
									<div className='flex items-center gap-2'>
										<Mail className='h-4 w-4 text-muted-foreground' />
										<span>{quotation.customerInfo.email}</span>
									</div>
									<div className='flex items-center gap-2'>
										<Phone className='h-4 w-4 text-muted-foreground' />
										<span>{quotation.customerInfo.phone}</span>
									</div>
								</div>
								<div className='space-y-2'>
									<div className='flex items-start gap-2'>
										<MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
										<div>
											<p className='font-medium'>Customer Address:</p>
											<p className='text-sm text-muted-foreground'>{quotation.customerInfo.customerAddress}</p>
										</div>
									</div>
									{quotation.customerInfo.projectAddress && (
										<div className='flex items-start gap-2'>
											<MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
											<div>
												<p className='font-medium'>Project Address:</p>
												<p className='text-sm text-muted-foreground'>{quotation.customerInfo.projectAddress}</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Material Items */}
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle>Material Selections</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{quotation.selections.materialItems.map(item => (
									<div key={item.id} className='border rounded-lg p-4'>
										<div className='flex justify-between items-start mb-2'>
											<h4 className='font-semibold'>{item.label}</h4>
											<Badge variant='outline'>
												{item.unit_value} {getUnitDisplay(item)}
											</Badge>
										</div>
										<div className='grid md:grid-cols-2 gap-4 text-sm'>
											<div>
												<p>
													<span className='font-medium'>Material:</span> {item.material?.name || 'N/A'}
												</p>
												<p>
													<span className='font-medium'>Style:</span> {item.style?.name || 'N/A'}
												</p>
											</div>
											<div>
												<p>
													<span className='font-medium'>Size:</span> {formatSizeDisplay(item)}
												</p>
												<p>
													<span className='font-medium'>Finish:</span> {item.finish?.name || 'N/A'}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Add-ons */}
					{(quotation.addOns.customItems.length > 0 || quotation.addOns.customServices.length > 0) && (
						<Card className='mb-6'>
							<CardHeader>
								<CardTitle>Additional Items & Services</CardTitle>
							</CardHeader>
							<CardContent>
								{quotation.addOns.customItems.length > 0 && (
									<div className='mb-4'>
										<h4 className='font-semibold mb-2'>Custom Items</h4>
										<div className='space-y-2'>
											{quotation.addOns.customItems.map(item => (
												<div key={item.id} className='flex justify-between items-center text-sm'>
													<span>
														{item.name} ({item.quantity} {item.unit})
														{item.measurement && ` - ${item.measurement} ${item.unit}`}
													</span>
													<span>${(item.price * item.quantity).toFixed(2)}</span>
												</div>
											))}
										</div>
									</div>
								)}
								{quotation.addOns.customServices.length > 0 && (
									<div>
										<h4 className='font-semibold mb-2'>Services</h4>
										<div className='space-y-2'>
											{quotation.addOns.customServices.map(service => (
												<div key={service.id} className='flex justify-between items-center text-sm'>
													<span>{service.name}</span>
													<span>${service.price.toFixed(2)}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Pricing Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Pricing Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								<div className='flex justify-between'>
									<span>Material Cost</span>
									<span>${quotation.pricing.materialCost.toFixed(2)}</span>
								</div>
								{quotation.pricing.markupAmount > 0 && (
									<div className='flex justify-between'>
										<span>Markup</span>
										<span>${quotation.pricing.markupAmount.toFixed(2)}</span>
									</div>
								)}
								{quotation.pricing.customItemsCost > 0 && (
									<div className='flex justify-between'>
										<span>Custom Items</span>
										<span>${quotation.pricing.customItemsCost.toFixed(2)}</span>
									</div>
								)}
								{quotation.pricing.customServicesCost > 0 && (
									<div className='flex justify-between'>
										<span>Services</span>
										<span>${quotation.pricing.customServicesCost.toFixed(2)}</span>
									</div>
								)}
								<Separator />
								<div className='flex justify-between'>
									<span>Subtotal</span>
									<span>${quotation.pricing.subtotal.toFixed(2)}</span>
								</div>
								{quotation.pricingOptions.discount.enabled && quotation.pricing.discountAmount > 0 && (
									<div className='flex justify-between text-green-600'>
										<span>Discount ({quotation.pricingOptions.discount.value}%)</span>
										<span>-${quotation.pricing.discountAmount.toFixed(2)}</span>
									</div>
								)}
								{quotation.pricingOptions.discount.enabled && (
									<div className='flex justify-between'>
										<span>After Discount</span>
										<span>${quotation.pricing.afterDiscount.toFixed(2)}</span>
									</div>
								)}
								{quotation.pricingOptions.gst.enabled && quotation.pricing.gstAmount > 0 && (
									<div className='flex justify-between'>
										<span>GST ({quotation.pricingOptions.gst.percentage}%)</span>
										<span>${quotation.pricing.gstAmount.toFixed(2)}</span>
									</div>
								)}
								<Separator />
								<div className='flex justify-between text-lg font-bold'>
									<span>Final Total</span>
									<span>${quotation.pricing.finalTotal.toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
