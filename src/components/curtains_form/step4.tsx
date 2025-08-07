import type React from 'react'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'
import type { QuoteData, AddOn } from './types'
import { unitTypes } from './data'

interface Step4Props {
	quoteData: QuoteData
	setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
}

export function Step4({ quoteData, setQuoteData }: Step4Props) {
	const addAddOn = () => {
		const newAddOn: AddOn = {
			id: Date.now().toString(),
			name: '',
			description: '',
			unitType: 'each',
			unitPrice: 0,
			quantity: 1,
		}
		setQuoteData(prev => ({
			...prev,
			addOns: [...prev.addOns, newAddOn],
		}))
	}

	const updateAddOn = (addOnId: string, updates: Partial<AddOn>) => {
		setQuoteData(prev => ({
			...prev,
			addOns: prev.addOns.map(addOn =>
				addOn.id === addOnId ? { ...addOn, ...updates } : addOn,
			),
		}))
	}

	const removeAddOn = (addOnId: string) => {
		setQuoteData(prev => ({
			...prev,
			addOns: prev.addOns.filter(addOn => addOn.id !== addOnId),
		}))
	}

	return (
		<div className='space-y-6'>
			<h3 className='text-lg font-semibold'>Add-ons & Services</h3>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>Delivery & Services</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label>Delivery Option</Label>
						<Select
							value={quoteData.deliveryOption}
							onValueChange={value =>
								setQuoteData(prev => ({ ...prev, deliveryOption: value }))
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='standard'>
									Standard Delivery (Free)
								</SelectItem>
								<SelectItem value='express'>Express Delivery (+$50)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='flex items-center space-x-2'>
						<Checkbox
							id='installation'
							checked={quoteData.installationService}
							onCheckedChange={checked =>
								setQuoteData(prev => ({
									...prev,
									installationService: checked as boolean,
								}))
							}
						/>
						<Label htmlFor='installation'>Installation Service (+$150)</Label>
					</div>

					<div className='flex items-center space-x-2'>
						<Checkbox
							id='siteMeasurement'
							checked={quoteData.siteMeasurement}
							onCheckedChange={checked =>
								setQuoteData(prev => ({
									...prev,
									siteMeasurement: checked as boolean,
								}))
							}
						/>
						<Label htmlFor='siteMeasurement'>
							Site Measurement Service (+$75)
						</Label>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className='text-base'>GST Configuration</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex items-center space-x-2'>
						<Checkbox
							id='gstEnabled'
							checked={quoteData.gstEnabled}
							onCheckedChange={checked =>
								setQuoteData(prev => ({
									...prev,
									gstEnabled: checked as boolean,
								}))
							}
						/>
						<Label htmlFor='gstEnabled'>Apply GST to this quote</Label>
					</div>

					{quoteData.gstEnabled && (
						<div className='space-y-2'>
							<Label htmlFor='gstRate'>GST Rate (%)</Label>
							<Input
								id='gstRate'
								type='number'
								step='0.1'
								min='0'
								max='100'
								value={quoteData.gstRate}
								onChange={e =>
									setQuoteData(prev => ({
										...prev,
										gstRate: Number.parseFloat(e.target.value) || 0,
									}))
								}
								placeholder='Enter GST rate (e.g., 10)'
							/>
							<p className='text-sm text-muted-foreground'>
								GST will be calculated on the total amount after tax and
								discount
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className='flex justify-between items-center'>
						<CardTitle className='text-base'>Additional Items</CardTitle>
						<Button
							onClick={addAddOn}
							size='sm'
							className='flex items-center gap-2'
						>
							<Plus className='w-4 h-4' />
							Add Item
						</Button>
					</div>
				</CardHeader>
				<CardContent className='space-y-4'>
					{quoteData.addOns.map(addOn => (
						<div key={addOn.id} className='border rounded-lg p-4 space-y-4'>
							<div className='flex justify-between items-start'>
								<h4 className='font-medium'>Custom Item</h4>
								<Button
									variant='outline'
									size='sm'
									onClick={() => removeAddOn(addOn.id)}
									className='text-red-600 hover:text-red-700'
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Item Name *</Label>
									<Input
										value={addOn.name}
										onChange={e =>
											updateAddOn(addOn.id, { name: e.target.value })
										}
										placeholder='Enter item name'
									/>
								</div>

								<div className='space-y-2'>
									<Label>Unit Type</Label>
									<Select
										value={addOn.unitType}
										onValueChange={value =>
											updateAddOn(addOn.id, { unitType: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{unitTypes.map(type => (
												<SelectItem key={type} value={type}>
													{type === 'each'
														? 'Each'
														: type === 'sqm'
															? 'Square Meter'
															: type === 'linear'
																? 'Linear Meter'
																: 'Hour'}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='space-y-2'>
								<Label>Description</Label>
								<Textarea
									value={addOn.description}
									onChange={e =>
										updateAddOn(addOn.id, { description: e.target.value })
									}
									placeholder='Optional description'
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label>Unit Price ($)</Label>
									<Input
										type='number'
										step='0.01'
										min='0'
										value={addOn.unitPrice}
										onChange={e =>
											updateAddOn(addOn.id, {
												unitPrice: Number.parseFloat(e.target.value) || 0,
											})
										}
									/>
								</div>

								<div className='space-y-2'>
									<Label>Quantity</Label>
									<Input
										type='number'
										min='1'
										value={addOn.quantity}
										onChange={e =>
											updateAddOn(addOn.id, {
												quantity: Number.parseInt(e.target.value) || 1,
											})
										}
									/>
								</div>

								<div className='space-y-2'>
									<Label>Total</Label>
									<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
										${(addOn.unitPrice * addOn.quantity).toFixed(2)}
									</div>
								</div>
							</div>
						</div>
					))}

					{quoteData.addOns.length === 0 && (
						<div className='text-center py-8 text-muted-foreground'>
							No additional items added.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
