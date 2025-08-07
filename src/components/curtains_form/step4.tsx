import type React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import type { QuoteData, ProductDatabase } from './types'
import {
	calculateSubtotalBeforeAll,
	calculateDiscount,
	calculateTotalGST,
	calculateTotal,
	calculateTotalMarkup,
} from './calculations'

interface Step4Props {
	quoteData: QuoteData
	setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
	productDatabase: ProductDatabase
}

export function Step4PricingDiscounts({
	quoteData,
	setQuoteData,
	productDatabase,
}: Step4Props) {
	return (
		<div className='space-y-6'>
			<h3 className='text-lg font-semibold'>Pricing & Discounts</h3>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Add Markup </CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center space-x-2'>
						<Checkbox
							id='markupEnabled'
							checked={quoteData.markupEnabled}
							onCheckedChange={checked =>
								setQuoteData(prev => ({
									...prev,
									markupEnabled: checked as boolean,
								}))
							}
						/>
						<Label htmlFor='markupEnabled'>Apply Markup to Products</Label>
					</div>

					{quoteData.markupEnabled && (
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							<div className='space-y-2'>
								<Label>Markup Type</Label>
								<Select
									value={quoteData.markupType}
									onValueChange={(value: 'percentage' | 'fixed') =>
										setQuoteData(prev => ({ ...prev, markupType: value }))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='percentage'>Percentage (%)</SelectItem>
										<SelectItem value='fixed'>Fixed Amount ($)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label>
									Markup Value{' '}
									{quoteData.markupType === 'percentage' ? '(%)' : '($)'}
								</Label>
								<Input
									type='number'
									step={quoteData.markupType === 'percentage' ? '0.1' : '0.01'}
									min='0'
									value={quoteData.markupValue}
									onChange={e =>
										setQuoteData(prev => ({
											...prev,
											markupValue: Number.parseFloat(e.target.value) || 0,
										}))
									}
								/>
							</div>

							<div className='space-y-2'>
								<Label>Total Markup</Label>
								<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
									+$
									{calculateTotalMarkup(quoteData, productDatabase).toFixed(2)}
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Add Discount</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div className='space-y-2'>
							<Label>Discount Type</Label>
							<Select
								value={quoteData.discountType}
								onValueChange={(value: 'percentage' | 'fixed') =>
									setQuoteData(prev => ({ ...prev, discountType: value }))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='percentage'>Percentage (%)</SelectItem>
									<SelectItem value='fixed'>Fixed Amount ($)</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label>
								Discount Value{' '}
								{quoteData.discountType === 'percentage' ? '(%)' : '($)'}
							</Label>
							<Input
								type='number'
								step='0.01'
								min='0'
								max={
									quoteData.discountType === 'percentage' ? '100' : undefined
								}
								value={quoteData.discountValue}
								onChange={e =>
									setQuoteData(prev => ({
										...prev,
										discountValue: Number.parseFloat(e.target.value) || 0,
									}))
								}
							/>
						</div>

						<div className='space-y-2'>
							<Label>Discount Amount</Label>
							<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
								-${calculateDiscount(quoteData, productDatabase).toFixed(2)}
							</div>
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Discount Reason</Label>
						<Input
							value={quoteData.discountReason}
							onChange={e =>
								setQuoteData(prev => ({
									...prev,
									discountReason: e.target.value,
								}))
							}
							placeholder='Reason for discount (optional)'
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Pricing Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						<div className='flex justify-between'>
							<span>Subtotal:</span> {/* Updated label */}
							<span>
								$
								{calculateSubtotalBeforeAll(quoteData, productDatabase).toFixed(
									2,
								)}
							</span>{' '}
							{/* Updated function */}
						</div>
						{quoteData.markupEnabled && (
							<div className='flex justify-between text-green-600'>
								<span>Markup:</span>
								<span>
									+$
									{calculateTotalMarkup(quoteData, productDatabase).toFixed(2)}
								</span>
							</div>
						)}
						{quoteData.gstEnabled && (
							<div className='flex justify-between text-muted-foreground'>
								<span>Total GST ({quoteData.gstRate}%):</span>
								<span>
									${calculateTotalGST(quoteData, productDatabase).toFixed(2)}
								</span>
							</div>
						)}
						{quoteData.discountValue > 0 && (
							<div className='flex justify-between text-red-600'>
								<span>
									Discount ({quoteData.discountValue}
									{quoteData.discountType === 'fixed' ? '$' : '%'}):
								</span>
								<span>
									-${calculateDiscount(quoteData, productDatabase).toFixed(2)}
								</span>
							</div>
						)}
						<Separator />
						<div className='flex justify-between text-xl font-bold'>
							<span>Total:</span>
							<span>
								${calculateTotal(quoteData, productDatabase).toFixed(2)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
