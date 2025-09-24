import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PricingSummary } from './pricing-summary'
import { calculateSingleMaterialCostWithGstAndMarkup, formatCurrency } from './calculations'
import type { CalculationResult, Selections, AddOns, PricingOptions, CustomerInfo } from './types'

interface Step5Props {
	customerInfo: CustomerInfo
	selections: Selections
	addOns: AddOns
	pricingOptions: PricingOptions
	pricing: CalculationResult
	onPrevious: () => void
	onSave: () => void
	onEmail: () => void
	onGeneratePDF: () => void
	onStepJump: (step: number) => void
}

export function Step5({
	customerInfo,
	selections,
	addOns,
	pricingOptions,
	pricing,
	onPrevious,
	onSave,
	onEmail,
	onGeneratePDF,
	onStepJump,
}: Step5Props) {
	return (
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			<div className='lg:col-span-2 space-y-6'>
				{/* Customer Information Review */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>Customer Information</CardTitle>
						<Button variant='outline' size='sm' onClick={() => onStepJump(1)}>
							Edit
						</Button>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div>
							<strong>Name:</strong> {customerInfo.name}
						</div>
						<div>
							<strong>Email:</strong> {customerInfo.email}
						</div>
						<div>
							<strong>Phone:</strong> {customerInfo.phone}
						</div>
						<div>
							<strong>Customer Address:</strong> {customerInfo.customerAddress}
						</div>
						<div>
							<strong>Project Address:</strong> {customerInfo.projectAddress || 'Not specified'}
						</div>
					</CardContent>
				</Card>

				{/* Material Selection Review */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>Material Selection</CardTitle>
						<Button variant='outline' size='sm' onClick={() => onStepJump(2)}>
							Edit
						</Button>
					</CardHeader>
					<CardContent className='space-y-4'>
						{selections.materialItems && selections.materialItems.length > 0 ? (
							selections.materialItems.map((item, index) => (
								<div key={index} className='border-b pb-3 last:border-b-0 last:pb-0'>
									<div className='flex justify-between items-start mb-2'>
										<h4 className='font-medium'>{item.label}</h4>
										<div className='text-right'>
											<div className='font-semibold text-lg text-blue-600'>
												{formatCurrency(calculateSingleMaterialCostWithGstAndMarkup(item))}
											</div>
											<div className='text-xs text-gray-500'>Total Cost</div>
										</div>
									</div>
									<div className='space-y-1 text-sm'>
										<div>
											<strong>Material:</strong> {item.material?.name} ($
											{item.material?.basePrice}/sq ft)
										</div>
										<div>
											<strong>Style:</strong> {item.style?.name} ({item.style?.multiplier}x multiplier)
										</div>
										<div>
											<strong>Size:</strong> {item.size?.name}
											<div className='flex gap-1'>
												({item.size?.size.type === 'linear_meter' && 'Linear Meter'}{' '}
												{item.size?.size.type === 'height_width' &&
													`${item.size?.size.height} x ${item.size?.size.height} ${item.size.size.price_type === 'fixed_price' ? '@' : 'x'}  ${item.size?.size.pricing}`}
												{item.size?.size.type === 'linear_meter' && `@ ${item.size?.size.pricing}$`})
											</div>
										</div>
										<div>
											<strong>Finish:</strong> {item.finish?.name} (+$
											{item.finish?.premium}/sq ft)
										</div>
										<div>
											<strong>Square Footage:</strong> {item.unit_value} sq ft
										</div>
									</div>
								</div>
							))
						) : (
							<div className='text-gray-500'>No materials selected</div>
						)}
						<div className='pt-2 border-t'>
							<strong>Total Material Cost:</strong> {formatCurrency(pricing.materialCost)} + GST
						</div>
					</CardContent>
				</Card>

				{/* Add-ons Review */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>Add-ons & Custom Items</CardTitle>
						<Button variant='outline' size='sm' onClick={() => onStepJump(3)}>
							Edit
						</Button>
					</CardHeader>
					<CardContent className='space-y-4'>
						{/* Custom Items */}
						{addOns.customItems.length > 0 && (
							<div>
								<h4 className='font-medium mb-2'>Custom Items:</h4>
								{addOns.customItems.map(item => (
									<div key={item.id} className='text-sm'>
										{item.name} - ${item.price} × {item.quantity} {item.unit} ={' '}
										{formatCurrency(item.price * item.quantity)}
									</div>
								))}
								<div className='text-sm font-medium mt-1'>
									Total Custom Items: {formatCurrency(pricing.customItemsCost)}
								</div>
							</div>
						)}

						{/* Custom Services */}
						{addOns.customServices.length > 0 && (
							<div>
								<h4 className='font-medium mb-2'>Custom Services:</h4>
								{addOns.customServices.map(service => (
									<div key={service.id} className='text-sm'>
										{service.name} - {formatCurrency(service.price)}
									</div>
								))}
								<div className='text-sm font-medium mt-1'>
									Total Custom Services: {formatCurrency(pricing.customServicesCost)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Pricing Options Review */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>Discount & GST</CardTitle>
						<Button variant='outline' size='sm' onClick={() => onStepJump(4)}>
							Edit
						</Button>
					</CardHeader>
					<CardContent className='space-y-2'>
						<div>
							<strong>Discount:</strong>{' '}
							{pricingOptions.discount.enabled
								? `${pricingOptions.discount.value}% (${formatCurrency(pricing.discountAmount)})`
								: 'None'}
						</div>
						<div>
							<strong>GST:</strong>{' '}
							{pricingOptions.gst.enabled
								? `${pricingOptions.gst.percentage}% (${formatCurrency(pricing.gstAmount)})`
								: 'None'}
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<Card>
					<CardContent className='pt-6'>
						<div className='flex flex-wrap gap-3'>
							<Button onClick={onSave} variant='outline'>
								Save Quote
							</Button>
							<Button onClick={onEmail} variant='outline'>
								Email Quote
							</Button>
							<Button onClick={onGeneratePDF}>Generate PDF</Button>
						</div>
					</CardContent>
				</Card>

				<div className='flex justify-start mt-6'>
					<Button variant='outline' onClick={onPrevious}>
						Previous
					</Button>
				</div>
			</div>

			<div>
				<PricingSummary pricing={pricing} />
			</div>
		</div>
	)
}
