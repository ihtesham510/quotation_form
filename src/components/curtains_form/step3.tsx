import type React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Calculator } from 'lucide-react'
import type { QuoteData, AddOn, CustomService } from './types'
import { unitTypes } from './data'
import { calculateAddOnTotal, calculateAddOnGST } from './calculations'

interface Step3Props {
	quoteData: QuoteData
	setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
}

type MeasurementUnit = 'm' | 'cm' | 'mm'

const convertToMeters = (value: number, unit: MeasurementUnit): number => {
	if (unit === 'cm') return value / 100
	if (unit === 'mm') return value / 1000
	return value
}

const convertFromMeters = (valueInMeters: number, unit: MeasurementUnit): number => {
	if (unit === 'cm') return valueInMeters * 100
	if (unit === 'mm') return valueInMeters * 1000
	return valueInMeters
}

export function Step3AddonsServices({ quoteData, setQuoteData }: Step3Props) {
	const [addOnUnits, setAddOnUnits] = useState<Record<string, MeasurementUnit>>({})

	const addAddOn = () => {
		const newAddOn: AddOn = {
			id: Date.now().toString(),
			name: '',
			description: '',
			unitType: 'each',
			unitPrice: 0,
			quantity: 1,
			width: 0,
			height: 0,
			length: 0,
		}
		setQuoteData(prev => ({
			...prev,
			addOns: [...prev.addOns, newAddOn],
		}))
		setAddOnUnits(prev => ({ ...prev, [newAddOn.id]: 'm' }))
	}

	const updateAddOn = (addOnId: string, updates: Partial<AddOn>) => {
		setQuoteData(prev => ({
			...prev,
			addOns: prev.addOns.map(addOn => {
				if (addOn.id === addOnId) {
					const updatedAddOn = { ...addOn, ...updates }
					if (updates.unitType && updates.unitType !== addOn.unitType) {
						updatedAddOn.width = 0
						updatedAddOn.height = 0
						updatedAddOn.length = 0
					}
					return updatedAddOn
				}
				return addOn
			}),
		}))
	}

	const removeAddOn = (addOnId: string) => {
		setQuoteData(prev => ({
			...prev,
			addOns: prev.addOns.filter(addOn => addOn.id !== addOnId),
		}))
		setAddOnUnits(prev => {
			const newUnits = { ...prev }
			delete newUnits[addOnId]
			return newUnits
		})
	}

	const handleAddOnUnitChange = (addOnId: string, unit: MeasurementUnit) => {
		setAddOnUnits(prev => ({ ...prev, [addOnId]: unit }))
	}

	const addCustomService = () => {
		const newService: CustomService = {
			id: Date.now().toString(),
			name: '',
			description: '',
			price: 0,
		}
		setQuoteData(prev => ({
			...prev,
			customServices: [...prev.customServices, newService],
		}))
	}

	const updateCustomService = (serviceId: string, updates: Partial<CustomService>) => {
		setQuoteData(prev => ({
			...prev,
			customServices: prev.customServices.map(service =>
				service.id === serviceId ? { ...service, ...updates } : service,
			),
		}))
	}

	const removeCustomService = (serviceId: string) => {
		setQuoteData(prev => ({
			...prev,
			customServices: prev.customServices.filter(service => service.id !== serviceId),
		}))
	}

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<div className='flex justify-between items-center'>
						<CardTitle className='text-base'>Custom Services & Charges</CardTitle>
						<Button onClick={addCustomService} size='sm' className='flex items-center gap-2'>
							<Plus className='w-4 h-4' />
							<p className='hidden md:inline-flex'>Add Service</p>
						</Button>
					</div>
				</CardHeader>
				<CardContent className='space-y-4'>
					{quoteData.customServices.map(service => (
						<div key={service.id} className='border rounded-lg p-4 space-y-4'>
							<div className='flex justify-between items-start'>
								<h4 className='font-medium'>Custom Service</h4>
								<Button
									variant='outline'
									size='sm'
									onClick={() => removeCustomService(service.id)}
									className='text-red-600 hover:text-red-700'
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Service Name *</Label>
									<Input
										value={service.name}
										onChange={e => updateCustomService(service.id, { name: e.target.value })}
										placeholder='e.g., Express Delivery, Installation'
									/>
								</div>
								<div className='space-y-2'>
									<Label>Price ($) *</Label>
									<Input
										type='number'
										step='0.01'
										min='0'
										value={service.price}
										onChange={e =>
											updateCustomService(service.id, {
												price: Number.parseFloat(e.target.value) || 0,
											})
										}
										placeholder='Enter price'
									/>
								</div>
							</div>
							<div className='space-y-2'>
								<Label>Description</Label>
								<Textarea
									value={service.description}
									onChange={e =>
										updateCustomService(service.id, {
											description: e.target.value,
										})
									}
									placeholder='Optional description for the service'
								/>
							</div>
						</div>
					))}
					{quoteData.customServices.length === 0 && (
						<div className='text-center py-8 text-muted-foreground'>No custom services added.</div>
					)}
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
								GST will be calculated on the total amount after tax and discount
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className='flex justify-between items-center'>
						<CardTitle className='text-base'>Additional Items</CardTitle>
						<Button onClick={addAddOn} size='sm' className='flex items-center gap-2'>
							<Plus className='w-4 h-4' />
							<p className='hidden md:inline-flex'>Add Item</p>
						</Button>
					</div>
				</CardHeader>
				<CardContent className='space-y-4'>
					{quoteData.addOns.map(addOn => {
						const currentUnit = addOnUnits[addOn.id] || 'm'
						const baseTotal =
							addOn.unitPrice *
							addOn.quantity *
							(addOn.unitType === 'sqm'
								? (addOn.width || 0) * (addOn.height || 0)
								: addOn.unitType === 'linear'
									? addOn.length || 0
									: 1)
						const gstAmount = calculateAddOnGST(addOn, quoteData.gstEnabled, quoteData.gstRate)
						const totalWithGST = calculateAddOnTotal(addOn, quoteData.gstEnabled, quoteData.gstRate)
						return (
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
											onChange={e => updateAddOn(addOn.id, { name: e.target.value })}
											placeholder='Enter item name'
										/>
									</div>

									<div className='space-y-2'>
										<Label>Unit Type</Label>
										<Select
											value={addOn.unitType}
											onValueChange={value =>
												updateAddOn(addOn.id, {
													unitType: value as 'each' | 'sqm' | 'linear',
												})
											}
										>
											<SelectTrigger className='w-full'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{unitTypes.map(type => (
													<SelectItem key={type} value={type}>
														{type === 'each' ? 'Each' : type === 'sqm' ? 'Square Meter' : 'Linear Meter'}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								{addOn.unitType === 'sqm' && (
									<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
										<div className='space-y-2'>
											<Label>Width ({currentUnit})</Label>
											<Input
												type='number'
												step='0.01'
												min='0'
												value={convertFromMeters(addOn.width || 0, currentUnit)}
												onChange={e =>
													updateAddOn(addOn.id, {
														width: convertToMeters(Number.parseFloat(e.target.value) || 0, currentUnit),
													})
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label>Height ({currentUnit})</Label>
											<Input
												type='number'
												step='0.01'
												min='0'
												value={convertFromMeters(addOn.height || 0, currentUnit)}
												onChange={e =>
													updateAddOn(addOn.id, {
														height: convertToMeters(Number.parseFloat(e.target.value) || 0, currentUnit),
													})
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label>Unit</Label>
											<Select
												value={currentUnit}
												onValueChange={(value: MeasurementUnit) => handleAddOnUnitChange(addOn.id, value)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='m'>Meters (m)</SelectItem>
													<SelectItem value='cm'>Centimeters (cm)</SelectItem>
													<SelectItem value='mm'>Millimeters (mm)</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className='space-y-2'>
											<Label>Area</Label>
											<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
												<Calculator className='w-4 h-4 mr-2' />
												{(addOn.width ?? 0 * (addOn.height ?? 0)).toFixed(2)} sqm
											</div>
										</div>
									</div>
								)}

								{addOn.unitType === 'linear' && (
									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<div className='space-y-2'>
											<Label>Length ({currentUnit})</Label>
											<Input
												type='number'
												step='0.01'
												min='0'
												value={convertFromMeters(addOn.length || 0, currentUnit)}
												onChange={e =>
													updateAddOn(addOn.id, {
														length: convertToMeters(Number.parseFloat(e.target.value) || 0, currentUnit),
													})
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label>Unit</Label>
											<Select
												value={currentUnit}
												onValueChange={(value: MeasurementUnit) => handleAddOnUnitChange(addOn.id, value)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='m'>Meters (m)</SelectItem>
													<SelectItem value='cm'>Centimeters (cm)</SelectItem>
													<SelectItem value='mm'>Millimeters (mm)</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className='space-y-2'>
											<Label>Total Length</Label>
											<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
												<Calculator className='w-4 h-4 mr-2' />
												{(addOn.length || 0).toFixed(2)} linear m
											</div>
										</div>
									</div>
								)}

								<div className='space-y-2'>
									<Label>Description</Label>
									<Textarea
										value={addOn.description}
										onChange={e => updateAddOn(addOn.id, { description: e.target.value })}
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
										<Label>Calculated Total</Label>
										<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
											${totalWithGST.toFixed(2)}
										</div>
									</div>
								</div>
								{quoteData.gstEnabled && gstAmount > 0 && (
									<div className='text-sm text-muted-foreground text-right'>
										Base: ${baseTotal.toFixed(2)} + GST: ${gstAmount.toFixed(2)}
									</div>
								)}
							</div>
						)
					})}

					{quoteData.addOns.length === 0 && (
						<div className='text-center py-8 text-muted-foreground'>No additional items added.</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
