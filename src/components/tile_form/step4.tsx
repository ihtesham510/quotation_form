import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { PricingSummary } from './pricing-summary'
import type { PricingOptions, CalculationResult } from './types'

interface Step4Props {
	pricingOptions: PricingOptions
	onPricingOptionsChange: (options: PricingOptions) => void
	onNext: () => void
	onPrevious: () => void
	pricing: CalculationResult
}

export function Step4({
	pricingOptions,
	onPricingOptionsChange,
	onNext,
	onPrevious,
	pricing,
}: Step4Props) {
	const handleDiscountChange = (enabled: boolean, value?: number) => {
		onPricingOptionsChange({
			...pricingOptions,
			discount: {
				enabled,
				value: enabled ? (value ?? 0) : 0,
			},
		})
	}

	const handleGSTChange = (enabled: boolean, percentage?: number) => {
		onPricingOptionsChange({
			...pricingOptions,
			gst: {
				enabled,
				percentage: enabled ? (percentage ?? 13) : 0,
			},
		})
	}

	return (
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			<div className='lg:col-span-2 space-y-6'>
				{/* Discount Section */}
				<Card>
					<CardHeader>
						<CardTitle>Discount</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center space-x-2'>
							<Switch
								checked={pricingOptions.discount.enabled}
								onCheckedChange={checked =>
									handleDiscountChange(checked, pricingOptions.discount.value)
								}
							/>
							<Label>Apply discount</Label>
						</div>

						{pricingOptions.discount.enabled && (
							<div className='space-y-2'>
								<Label htmlFor='discount'>Discount Percentage</Label>
								<Input
									id='discount'
									type='number'
									min='0'
									max='100'
									step='0.1'
									value={pricingOptions.discount.value || 0}
									onChange={e =>
										handleDiscountChange(
											true,
											Number.parseFloat(e.target.value) || 0,
										)
									}
								/>
								<p className='text-sm text-gray-600'>
									Discount applies to the grand total before GST
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* GST Section */}
				<Card>
					<CardHeader>
						<CardTitle>GST/Tax</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center space-x-2'>
							<Switch
								checked={pricingOptions.gst.enabled}
								onCheckedChange={checked =>
									handleGSTChange(checked, pricingOptions.gst.percentage)
								}
							/>
							<Label>Apply GST/Tax</Label>
						</div>

						{pricingOptions.gst.enabled && (
							<div className='space-y-2'>
								<Label htmlFor='gst'>GST/Tax Percentage</Label>
								<Input
									id='gst'
									type='number'
									min='0'
									max='100'
									step='0.1'
									value={pricingOptions.gst.percentage || 13}
									onChange={e =>
										handleGSTChange(
											true,
											Number.parseFloat(e.target.value) || 13,
										)
									}
								/>
								<p className='text-sm text-gray-600'>
									GST applies to each item individually when enabled
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				<div className='flex justify-between mt-6'>
					<Button variant='outline' onClick={onPrevious}>
						Previous
					</Button>
					<Button onClick={onNext}>Next</Button>
				</div>
			</div>

			<div>
				<PricingSummary pricing={pricing} />
			</div>
		</div>
	)
}
