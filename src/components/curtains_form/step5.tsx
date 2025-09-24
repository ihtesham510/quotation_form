import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { QuoteData, ProductDatabase, SelfContainedQuoteData } from './types'
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
	isProductPricingValid,
	getInvalidPricingProducts,
} from './calculations'
import { DownloadIcon, SaveIcon, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface Step5Props {
	quoteData: QuoteData
	onSaveQuote?: (data: SelfContainedQuoteData) => void
	onGeneratePDF?: (data: SelfContainedQuoteData) => void
	onEmail?: (data: SelfContainedQuoteData) => void
	productDatabase: ProductDatabase
}

export function Step5QuotePreview({ quoteData, onSaveQuote, onGeneratePDF, onEmail, productDatabase }: Step5Props) {
	// Check for invalid pricing products
	const invalidProducts = getInvalidPricingProducts(quoteData, productDatabase)
	const hasValidProducts = quoteData.products.some(product => isProductPricingValid(product, productDatabase))
	const totalValidProducts = quoteData.products.filter(product =>
		isProductPricingValid(product, productDatabase),
	).length

	const selfContainedData: SelfContainedQuoteData = {
		id: Date.now().toString(),
		savedAt: new Date().toISOString(),
		customer: { ...quoteData.customer },
		quoteDate: quoteData.quoteDate,
		paymentTerms: quoteData.paymentTerms,
		products: quoteData.products
			.filter(product => isProductPricingValid(product, productDatabase)) // Only include valid products
			.map(product => {
				const productInfo = productDatabase.products.find(p => p._id === product.productId)
				const basePrice = calculateProductOriginalBasePrice(product, productDatabase)
				const effectivePrice = calculateProductEffectiveBasePrice(product, quoteData, productDatabase)
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
						productDatabase.categories.find(c => c._id === productInfo?.categoryId)?.name || 'Unknown Category',
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
			const total = calculateAddOnTotal(addOn, quoteData.gstEnabled, quoteData.gstRate)
			const gstAmount = calculateAddOnGST(addOn, quoteData.gstEnabled, quoteData.gstRate)

			return {
				...addOn,
				total,
				gstAmount,
			}
		}),

		customServices: quoteData.customServices.map(service => {
			const total = calculateCustomServiceTotal(service, quoteData.gstEnabled, quoteData.gstRate)
			const gstAmount = calculateCustomServiceGST(service, quoteData.gstEnabled, quoteData.gstRate)

			return {
				...service,
				total,
				gstAmount,
			}
		}),

		pricing: {
			subtotalBeforeMarkupAndDiscount: calculateSubtotalBeforeAll(quoteData, productDatabase),
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

	const canGenerateQuote = hasValidProducts && selfContainedData.pricing.grandTotal > 0

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<h3 className='text-lg font-semibold'>Quote Preview</h3>
				{quoteData.products.length > 0 && (
					<div className='flex items-center gap-2'>
						{canGenerateQuote ? (
							<Badge variant='default' className='flex items-center gap-1'>
								<CheckCircle className='h-3 w-3' />
								Ready to Generate
							</Badge>
						) : (
							<Badge variant='destructive' className='flex items-center gap-1'>
								<AlertTriangle className='h-3 w-3' />
								Pricing Issues
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Invalid Products Alert */}
			{invalidProducts.length > 0 && (
				<Alert variant='destructive'>
					<AlertTriangle className='h-4 w-4' />
					<AlertDescription>
						<div className='space-y-2'>
							<p className='font-medium'>
								{invalidProducts.length} product{invalidProducts.length !== 1 ? 's' : ''} cannot be priced and will be
								excluded from the quote:
							</p>
							<ul className='list-disc list-inside space-y-1'>
								{invalidProducts.map(product => (
									<li key={product.id} className='text-sm'>
										<strong>{product.name}</strong>: {product.reason}
									</li>
								))}
							</ul>
							<p className='text-sm'>Please fix these pricing issues before generating the final quote.</p>
						</div>
					</AlertDescription>
				</Alert>
			)}

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
								<strong>Project Address:</strong> {quoteData.customer.projectAddress}
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>
						Product Breakdown{quoteData.gstEnabled && ' (Incl. GST)'}
						{totalValidProducts < quoteData.products.length && (
							<span className='text-sm font-normal text-muted-foreground ml-2'>
								({totalValidProducts} of {quoteData.products.length} products shown)
							</span>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{!hasValidProducts ? (
						<p className='text-muted-foreground'>No products with valid pricing in this quote.</p>
					) : (
						quoteData.products
							.filter(product => isProductPricingValid(product, productDatabase))
							.map((product, _) => {
								const productInfo = productDatabase.products.find(p => p._id === product.productId)
								const sqm = product.width * product.height
								const baseTotal = calculateProductTotalAfterMarkup(product, quoteData, productDatabase)
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

								const originalPrice = calculateProductOriginalBasePrice(product, productDatabase)
								const effectivePrice = calculateProductEffectiveBasePrice(product, quoteData, productDatabase)

								return (
									<div key={product.id} className='border-b pb-4 last:border-b-0 last:pb-0'>
										<div className='flex justify-between items-start mb-2'>
											<div className='flex-1'>
												<h4 className='font-medium text-base'>{product.label}</h4>
												<div className='flex items-center gap-2 mt-1'>
													<span className='text-sm text-muted-foreground'>
														{productInfo?.name || 'Unknown Product'}
													</span>
													<Badge variant='outline' className='text-xs'>
														{productInfo?.priceType}
													</Badge>
													<span className='text-sm text-muted-foreground'>Qty: {product.quantity}</span>
												</div>
											</div>
											<div className='text-right'>
												<div className='font-semibold text-lg'>${totalWithGST.toFixed(2)}</div>
												{quoteData.gstEnabled && gstAmount > 0 && (
													<div className='text-xs text-muted-foreground'>
														Base: ${baseTotal.toFixed(2)} + GST: ${gstAmount.toFixed(2)}
													</div>
												)}
											</div>
										</div>

										{/* Pricing Details */}
										<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground'>
											<div>
												{productInfo?.priceType === 'sqm' && (
													<p>
														Dimensions: {product.width}m × {product.height}m ({sqm.toFixed(2)} sqm)
													</p>
												)}
												{productInfo?.priceType === 'matrix' && (
													<p>
														Matrix Size: {product.width}m × {product.height}m (${originalPrice.toFixed(2)})
													</p>
												)}
												{productInfo?.priceType === 'each' && <p>Unit Price: ${originalPrice.toFixed(2)} each</p>}
												{quoteData.markupEnabled && effectivePrice !== originalPrice && (
													<p>Markup Applied: ${(effectivePrice - originalPrice).toFixed(2)} per unit</p>
												)}
											</div>
											<div>
												{product.color !== 'White' && <p>Color: {product.color}</p>}
												{product.controlType !== 'Cord' && <p>Control: {product.controlType}</p>}
												{product.installation && <p>Installation: Included</p>}
											</div>
										</div>

										{product.specialFeatures && (
											<div className='mt-2 p-2 bg-muted rounded text-sm'>
												<strong>Special Features:</strong> {product.specialFeatures}
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
						<CardTitle className='text-base'>Additional Items & Services</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						{quoteData.addOns.map(addOn => {
							const baseTotal = calculateAddOnBaseTotal(addOn)
							const gstAmount = calculateAddOnGST(addOn, quoteData.gstEnabled, quoteData.gstRate)
							const totalWithGST = calculateAddOnTotal(addOn, quoteData.gstEnabled, quoteData.gstRate)

							let dimensions = ''
							if (addOn.unitType === 'sqm') {
								dimensions = ` (${addOn.width || 0}m × ${addOn.height || 0}m)`
							} else if (addOn.unitType === 'linear') {
								dimensions = ` (${addOn.length || 0}m)`
							}

							return (
								<div key={addOn.id} className='flex justify-between items-start'>
									<div className='flex-1'>
										<div className='font-medium'>{addOn.name}</div>
										<div className='text-sm text-muted-foreground'>
											{addOn.quantity} × ${addOn.unitPrice.toFixed(2)} per {addOn.unitType}
											{dimensions}
										</div>
										{addOn.description && <div className='text-xs text-muted-foreground mt-1'>{addOn.description}</div>}
										{quoteData.gstEnabled && (
											<div className='text-xs text-muted-foreground'>
												Base: ${baseTotal.toFixed(2)} + GST: ${gstAmount.toFixed(2)}
											</div>
										)}
									</div>
									<div className='font-semibold'>${totalWithGST.toFixed(2)}</div>
								</div>
							)
						})}
						{quoteData.customServices.map(service => {
							const gstAmount = calculateCustomServiceGST(service, quoteData.gstEnabled, quoteData.gstRate)
							const totalWithGST = calculateCustomServiceTotal(service, quoteData.gstEnabled, quoteData.gstRate)
							return (
								<div key={service.id} className='flex justify-between items-start'>
									<div className='flex-1'>
										<div className='font-medium'>{service.name}</div>
										{service.description && <div className='text-sm text-muted-foreground'>{service.description}</div>}
										{quoteData.gstEnabled && gstAmount > 0 && (
											<div className='text-xs text-muted-foreground'>
												Base: ${service.price.toFixed(2)} + GST: ${gstAmount.toFixed(2)}
											</div>
										)}
									</div>
									<div className='font-semibold'>${totalWithGST.toFixed(2)}</div>
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
					<div className='space-y-3'>
						<div className='flex justify-between'>
							<span>Subtotal (before markup & discount):</span>
							<span>${selfContainedData.pricing.subtotalBeforeMarkupAndDiscount.toFixed(2)}</span>
						</div>
						{quoteData.markupEnabled && selfContainedData.pricing.totalMarkup > 0 && (
							<div className='flex justify-between text-muted-foreground'>
								<span>
									Markup (
									{quoteData.markupType === 'percentage' ? `${quoteData.markupValue}%` : `$${quoteData.markupValue}`}):
								</span>
								<span>+${selfContainedData.pricing.totalMarkup.toFixed(2)}</span>
							</div>
						)}
						<div className='flex justify-between'>
							<span>Subtotal (after markup):</span>
							<span>
								$
								{(
									selfContainedData.pricing.subtotalBeforeMarkupAndDiscount + selfContainedData.pricing.totalMarkup
								).toFixed(2)}
							</span>
						</div>
						{quoteData.gstEnabled && (
							<div className='flex justify-between text-muted-foreground'>
								<span>GST ({quoteData.gstRate}%):</span>
								<span>+${selfContainedData.pricing.totalGST.toFixed(2)}</span>
							</div>
						)}
						{selfContainedData.pricing.discountAmount > 0 && (
							<div className='flex justify-between text-muted-foreground'>
								<span>
									Discount (
									{quoteData.discountType === 'percentage'
										? `${quoteData.discountValue}%`
										: `$${quoteData.discountValue}`}
									){quoteData.discountReason && ` - ${quoteData.discountReason}`}:
								</span>
								<span>-${selfContainedData.pricing.discountAmount.toFixed(2)}</span>
							</div>
						)}
						<div className='border-t pt-2'>
							<div className='flex justify-between text-xl font-bold'>
								<span>Grand Total:</span>
								<span>${selfContainedData.pricing.grandTotal.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className='flex flex-col sm:flex-row justify-end gap-3'>
				{onSaveQuote && (
					<Button variant='outline' onClick={() => onSaveQuote(selfContainedData)} disabled={!canGenerateQuote}>
						<SaveIcon className='w-4 h-4 mr-2' />
						Save Quote
					</Button>
				)}
				{onGeneratePDF && (
					<Button variant='outline' onClick={() => onGeneratePDF(selfContainedData)} disabled={!canGenerateQuote}>
						<DownloadIcon className='w-4 h-4 mr-2' />
						Download PDF
					</Button>
				)}
				{onEmail && (
					<Button onClick={() => onEmail(selfContainedData)} disabled={!canGenerateQuote}>
						Email Quote
					</Button>
				)}
			</div>

			{!canGenerateQuote && quoteData.products.length > 0 && (
				<Alert>
					<Info className='h-4 w-4' />
					<AlertDescription>
						Quote actions are disabled until all pricing issues are resolved. Please return to the Product Selection
						step to fix invalid product configurations.
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}
