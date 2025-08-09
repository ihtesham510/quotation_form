import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
	QuoteData,
	ProductDatabase,
	SelfContainedQuoteData,
} from './types'
import {
	calculateDiscount,
	calculateTotal,
	calculateProductTotal,
	calculateProductGST,
	calculateAddOnTotal,
	calculateAddOnGST,
	calculateCustomServiceTotal,
	calculateCustomServiceGST,
	calculateTotalMarkup,
	calculateProductEffectiveBasePrice,
	calculateSubtotalBeforeAll,
	calculateTotalGST,
	calculateProductOriginalBasePrice,
	calculateAddOnBaseTotal,
	calculateProductTotalAfterMarkup,
} from './calculations'
import { DownloadIcon, SaveIcon } from 'lucide-react'

interface Step5Props {
	quoteData: QuoteData
	onSaveQuote?: (data: SelfContainedQuoteData) => void
	onGeneratePDF?: (data: SelfContainedQuoteData) => void
	onEmail?: (data: SelfContainedQuoteData) => void
	productDatabase: ProductDatabase
}

export function Step5QuotePreview({
	quoteData,
	onSaveQuote,
	onGeneratePDF,
	onEmail,
	productDatabase,
}: Step5Props) {
	const selfContainedData: SelfContainedQuoteData = {
		id: Date.now().toString(),
		savedAt: new Date().toISOString(),
		customer: { ...quoteData.customer },
		quoteDate: quoteData.quoteDate,
		paymentTerms: quoteData.paymentTerms,

		products: quoteData.products.map(product => {
			const productInfo = productDatabase.products.find(
				p => p._id === product.productId,
			)
			const basePrice = calculateProductOriginalBasePrice(
				product,
				productDatabase,
			)
			const effectivePrice = calculateProductEffectiveBasePrice(
				product,
				quoteData,
				productDatabase,
			)
			const total = calculateProductTotal(
				product,
				quoteData.gstEnabled,
				quoteData.gstRate,
				productDatabase,
				quoteData,
			)
			const gstAmount = calculateProductGST(
				product,
				quoteData.gstEnabled,
				quoteData.gstRate,
				productDatabase,
				quoteData,
			)

			return {
				id: product.id,
				name: productInfo?.name || 'Unknown Product',
				categoryName:
					productDatabase.categories.find(
						c => c._id === productInfo?.categoryId,
					)?.name || 'Unknown Category',
				priceType: productInfo?.priceType || 'each',
				label: product.label,
				basePrice,
				effectivePrice,
				width: product.width,
				height: product.height,
				quantity: product.quantity,
				color: product.color,
				controlType: product.controlType,
				installation: product.installation,
				specialFeatures: product.specialFeatures,
				total,
				gstAmount,
			}
		}),

		addOns: quoteData.addOns.map(addOn => {
			const total = calculateAddOnTotal(
				addOn,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)
			const gstAmount = calculateAddOnGST(
				addOn,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)

			return {
				...addOn,
				total,
				gstAmount,
			}
		}),

		customServices: quoteData.customServices.map(service => {
			const total = calculateCustomServiceTotal(
				service,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)
			const gstAmount = calculateCustomServiceGST(
				service,
				quoteData.gstEnabled,
				quoteData.gstRate,
			)

			return {
				...service,
				total,
				gstAmount,
			}
		}),

		pricing: {
			subtotalBeforeMarkupAndDiscount: calculateSubtotalBeforeAll(
				quoteData,
				productDatabase,
			),
			totalMarkup: calculateTotalMarkup(quoteData, productDatabase),
			discountType: quoteData.discountType,
			discountValue: quoteData.discountValue,
			discountReason: quoteData.discountReason,
			discountAmount: calculateDiscount(quoteData, productDatabase),
			gstEnabled: quoteData.gstEnabled,
			gstRate: quoteData.gstRate,
			totalGST: calculateTotalGST(quoteData, productDatabase),
			grandTotal: calculateTotal(quoteData, productDatabase),
		},
	}

	return (
		<div className='space-y-6'>
			<h3 className='text-lg font-semibold'>Quote Preview</h3>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Customer Information</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						<p>
							<strong>Name:</strong> {quoteData.customer.name}
						</p>
						<p>
							<strong>Email:</strong> {quoteData.customer.email}
						</p>
						<p>
							<strong>Phone:</strong> {quoteData.customer.phone}
						</p>
						{quoteData.customer.address && (
							<p>
								<strong>Address:</strong> {quoteData.customer.address}
							</p>
						)}
						{quoteData.customer.projectAddress && (
							<p>
								<strong>Project Address:</strong>{' '}
								{quoteData.customer.projectAddress}
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>
						Product Breakdown ( Incl. GST )
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{quoteData.products.length === 0 ? (
						<p className='text-muted-foreground'>
							No products added to this quote.
						</p>
					) : (
						quoteData.products.map((product, _) => {
							const productInfo = productDatabase.products.find(
								p => p._id === product.productId,
							)
							const sqm = product.width * product.height
							const baseTotal = calculateProductTotalAfterMarkup(
								product,
								quoteData,
								productDatabase,
							)
							const gstAmount = calculateProductGST(
								product,
								quoteData.gstEnabled,
								quoteData.gstRate,
								productDatabase,
								quoteData,
							)
							const totalWithGST = calculateProductTotal(
								product,
								quoteData.gstEnabled,
								quoteData.gstRate,
								productDatabase,
								quoteData,
							)

							return (
								<div
									key={product.id}
									className='border-b pb-2 last:border-b-0 last:pb-0'
								>
									<div className='flex justify-between items-start'>
										<div className='grid'>
											<h1 className='font-medium'>{product.label}</h1>
											<div className='font-medium'>
												{productInfo?.name || 'Unknown Product'} (Qty:{' '}
												{product.quantity})
											</div>
										</div>
										<div className='font-semibold'>
											${totalWithGST.toFixed(2)}
										</div>
									</div>
									<div className='text-sm text-muted-foreground'>
										{productInfo?.priceType === 'sqm' &&
											`${product.width}m x ${product.height}m (${sqm.toFixed(2)} sqm)`}
										{product.color !== 'White' && ` • ${product.color}`}
										{product.controlType !== 'Cord' &&
											` • ${product.controlType}`}
									</div>
									{quoteData.gstEnabled && gstAmount > 0 && (
										<div className='text-xs text-muted-foreground'>
											Base: ${baseTotal.toFixed(2)} + GST: $
											{gstAmount.toFixed(2)}
										</div>
									)}
									{product.specialFeatures && (
										<div className='text-xs text-muted-foreground italic'>
											Features: {product.specialFeatures}
										</div>
									)}
								</div>
							)
						})
					)}
				</CardContent>
			</Card>

			{(quoteData.addOns.length > 0 || quoteData.customServices.length > 0) && (
				<Card>
					<CardHeader>
						<CardTitle className='text-base'>
							Additional Items & Services
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						{quoteData.addOns.map(addOn => {
							const baseTotal = calculateAddOnBaseTotal(addOn)
							const gstAmount = calculateAddOnGST(
								addOn,
								quoteData.gstEnabled,
								quoteData.gstRate,
							)
							const totalWithGST = calculateAddOnTotal(
								addOn,
								quoteData.gstEnabled,
								quoteData.gstRate,
							)

							let addOnDetails = `${addOn.name} (${addOn.quantity} x ${addOn.unitPrice.toFixed(2)} ${addOn.unitType})`
							if (addOn.unitType === 'sqm') {
								addOnDetails += ` (${(addOn.width || 0).toFixed(2)}m x ${(addOn.height || 0).toFixed(2)}m)`
							} else if (addOn.unitType === 'linear') {
								addOnDetails += ` (${(addOn.length || 0).toFixed(2)}m)`
							}

							return (
								<div key={addOn.id} className='flex justify-between'>
									<span className='flex flex-col'>
										{addOnDetails}
										<span className='text-sm text-muted-foreground'>
											Base: ${baseTotal.toFixed(2)} + GST: $
											{gstAmount.toFixed(2)}{' '}
										</span>
									</span>
									<span> ${totalWithGST.toFixed(2)}</span>
								</div>
							)
						})}
						{quoteData.customServices.map(service => {
							const totalWithGST = calculateCustomServiceTotal(
								service,
								quoteData.gstEnabled,
								quoteData.gstRate,
							)
							return (
								<div key={service.id} className='flex justify-between'>
									<span>{service.name}</span>
									<span>${totalWithGST.toFixed(2)}</span>
								</div>
							)
						})}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Pricing Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						<div className='flex justify-between'>
							<span>Subtotal:</span>
							<span>
								$
								{(
									selfContainedData.pricing.subtotalBeforeMarkupAndDiscount +
									selfContainedData.pricing.totalMarkup
								).toFixed(2)}
							</span>
						</div>
						{quoteData.gstEnabled && (
							<div className='flex justify-between text-muted-foreground'>
								<span>Total GST ({quoteData.gstRate}%):</span>
								<span>${selfContainedData.pricing.totalGST.toFixed(2)}</span>
							</div>
						)}
						<div className='flex justify-between'>
							<span>Discount:</span>
							<span>
								-${selfContainedData.pricing.discountAmount.toFixed(2)}
							</span>
						</div>
						<div className='flex justify-between text-xl font-bold'>
							<span>Total:</span>
							<span>${selfContainedData.pricing.grandTotal.toFixed(2)}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className='flex justify-end space-x-4'>
				{onSaveQuote && (
					<Button
						variant='outline'
						onClick={() => onSaveQuote(selfContainedData)}
					>
						<SaveIcon className='size-4' />
						<p className='hidden md:inline-flex'>Save Quote</p>
					</Button>
				)}
				{onGeneratePDF && (
					<Button
						variant='outline'
						onClick={() => onGeneratePDF(selfContainedData)}
					>
						<DownloadIcon className='size-4' />
						<p className='hidden md:inline-flex'>Download PDF</p>
					</Button>
				)}

				{onEmail && (
					<Button onClick={() => onEmail(selfContainedData)}>Email</Button>
				)}
			</div>
		</div>
	)
}
