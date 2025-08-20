import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Plus, Edit3, Check, X } from 'lucide-react'
import { PricingSummary } from './pricing-summary'
import { generateUniqueId } from './calculations'
import { unitOptions } from './types'
import type { AddOns, CalculationResult, CustomItem, CustomService } from './types'
import { toast } from 'sonner'

interface Step3Props {
	addOns: AddOns
	onAddOnsChange: (addOns: AddOns) => void
	onNext: () => void
	onPrevious: () => void
	pricing: CalculationResult
}

export function Step3({ addOns, onAddOnsChange, onNext, onPrevious, pricing }: Step3Props) {
	const [showAddItemForm, setShowAddItemForm] = useState(false)
	const [showAddServiceForm, setShowAddServiceForm] = useState(false)
	const [editingItemId, setEditingItemId] = useState<string | null>(null)
	const [editingServiceId, setEditingServiceId] = useState<string | null>(null)

	const [newCustomItem, setNewCustomItem] = useState<Partial<CustomItem>>({
		name: '',
		price: 0,
		unit: 'each',
		quantity: 1,
		measurement: 1,
	})

	const [newCustomService, setNewCustomService] = useState<Partial<CustomService>>({
		name: '',
		price: 0,
	})

	const [editingItem, setEditingItem] = useState<CustomItem | null>(null)
	const [editingService, setEditingService] = useState<CustomService | null>(null)

	const handleMarkupChange = (enabled: boolean, value?: number) => {
		onAddOnsChange({
			...addOns,
			markup: enabled ? (value ?? 0) : undefined,
		})
	}

	const resetNewItemForm = () => {
		setNewCustomItem({
			name: '',
			price: 0,
			unit: 'each',
			quantity: 1,
			measurement: 1,
		})
		setShowAddItemForm(false)
	}

	const resetNewServiceForm = () => {
		setNewCustomService({ name: '', price: 0 })
		setShowAddServiceForm(false)
	}

	const addCustomItem = () => {
		if (!newCustomItem.name?.trim()) {
			toast.error('Please enter an item name')
			return
		}
		if (!newCustomItem.price || newCustomItem.price <= 0) {
			toast.error('Please enter a valid price greater than 0')
			return
		}
		if (!newCustomItem.quantity || newCustomItem.quantity <= 0) {
			toast.error('Please enter a valid quantity greater than 0')
			return
		}
		if (newCustomItem.unit !== 'each' && (!newCustomItem.measurement || newCustomItem.measurement <= 0)) {
			toast.error('Please enter a valid measurement greater than 0')
			return
		}

		const item: CustomItem = {
			id: generateUniqueId('custom'),
			name: newCustomItem.name,
			price: newCustomItem.price,
			unit: newCustomItem.unit || 'each',
			quantity: newCustomItem.quantity,
			measurement: newCustomItem.unit !== 'each' ? newCustomItem.measurement : undefined,
		}

		onAddOnsChange({
			...addOns,
			customItems: [...addOns.customItems, item],
		})

		resetNewItemForm()
	}

	const startEditingItem = (item: CustomItem) => {
		setEditingItem({ ...item })
		setEditingItemId(item.id)
	}

	const saveEditingItem = () => {
		if (!editingItem) return

		if (!editingItem.name?.trim()) {
			toast.error('Please enter an item name')
			return
		}
		if (!editingItem.price || editingItem.price <= 0) {
			toast('Please enter a valid price greater than 0')
			return
		}
		if (!editingItem.quantity || editingItem.quantity <= 0) {
			toast('Please enter a valid quantity greater than 0')
			return
		}
		if (editingItem.unit !== 'each' && (!editingItem.measurement || editingItem.measurement <= 0)) {
			toast.error('Please enter a valid measurement greater than 0')
			return
		}

		onAddOnsChange({
			...addOns,
			customItems: addOns.customItems.map(item => (item.id === editingItemId ? editingItem : item)),
		})

		setEditingItemId(null)
		setEditingItem(null)
	}

	const cancelEditingItem = () => {
		setEditingItemId(null)
		setEditingItem(null)
	}

	const removeCustomItem = (id: string) => {
		onAddOnsChange({
			...addOns,
			customItems: addOns.customItems.filter(item => item.id !== id),
		})
	}

	const addCustomService = () => {
		if (!newCustomService.name?.trim()) {
			toast.error('Please enter a service name')
			return
		}
		if (!newCustomService.price || newCustomService.price <= 0) {
			toast.error('Please enter a valid price greater than 0')
			return
		}

		const service: CustomService = {
			id: generateUniqueId('service'),
			name: newCustomService.name,
			price: newCustomService.price,
		}

		onAddOnsChange({
			...addOns,
			customServices: [...addOns.customServices, service],
		})

		resetNewServiceForm()
	}

	const startEditingService = (service: CustomService) => {
		setEditingService({ ...service })
		setEditingServiceId(service.id)
	}

	const saveEditingService = () => {
		if (!editingService) return

		if (!editingService.name?.trim()) {
			toast('Please enter a service name')
			return
		}
		if (!editingService.price || editingService.price <= 0) {
			toast.error('Please enter a valid price greater than 0')
			return
		}

		onAddOnsChange({
			...addOns,
			customServices: addOns.customServices.map(service =>
				service.id === editingServiceId ? editingService : service,
			),
		})

		setEditingServiceId(null)
		setEditingService(null)
	}

	const cancelEditingService = () => {
		setEditingServiceId(null)
		setEditingService(null)
	}

	const removeCustomService = (id: string) => {
		onAddOnsChange({
			...addOns,
			customServices: addOns.customServices.filter(service => service.id !== id),
		})
	}

	return (
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			<div className='lg:col-span-2 space-y-6'>
				{/* Markup Section */}
				<Card>
					<CardHeader>
						<CardTitle>Markup</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center space-x-2'>
							<Switch
								checked={addOns.markup !== null}
								onCheckedChange={checked => handleMarkupChange(checked, addOns.markup || 0)}
							/>
							<Label>Apply markup to tile materials</Label>
						</div>

						{addOns.markup !== null && (
							<div className='space-y-2'>
								<Label htmlFor='markup'>Markup Percentage</Label>
								<Input
									id='markup'
									type='number'
									min='0'
									step='0.1'
									value={addOns.markup || 0}
									onChange={e => handleMarkupChange(true, Number.parseFloat(e.target.value) || 0)}
								/>
								<p className='text-sm text-muted-foreground'>
									Note: Markup applies only to tile materials, not custom items or services
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Custom Items Section */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>Custom Items</CardTitle>
						{!showAddItemForm && (
							<Button onClick={() => setShowAddItemForm(true)} size='sm'>
								<Plus className='h-4 w-4 mr-2' />
								Add Item
							</Button>
						)}
					</CardHeader>
					<CardContent className='space-y-4'>
						{showAddItemForm && (
							<div className='border rounded-lg p-6 bg-secondary/50 space-y-6'>
								<div className='flex items-center justify-between'>
									<h4 className='font-semibold text-lg'>Add New Custom Item</h4>
									<Button variant='ghost' size='sm' onClick={resetNewItemForm}>
										<X className='h-4 w-4' />
									</Button>
								</div>

								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='item-name'>Item Name</Label>
											<Input
												id='item-name'
												placeholder='Enter item name'
												value={newCustomItem.name}
												onChange={e =>
													setNewCustomItem({
														...newCustomItem,
														name: e.target.value,
													})
												}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='item-price'>Price per Unit</Label>
											<Input
												id='item-price'
												type='number'
												placeholder='0.00'
												min='0'
												step='0.01'
												value={newCustomItem.price || ''}
												onChange={e =>
													setNewCustomItem({
														...newCustomItem,
														price: Number.parseFloat(e.target.value) || 0,
													})
												}
											/>
										</div>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='item-unit'>Unit</Label>
											<Select
												value={newCustomItem.unit}
												onValueChange={value => setNewCustomItem({ ...newCustomItem, unit: value })}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{unitOptions.map(unit => (
														<SelectItem key={unit} value={unit}>
															{unit}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='item-quantity'>Quantity</Label>
											<Input
												id='item-quantity'
												type='number'
												placeholder='1'
												min='1'
												value={newCustomItem.quantity || ''}
												onChange={e =>
													setNewCustomItem({
														...newCustomItem,
														quantity: Number.parseInt(e.target.value) || 1,
													})
												}
											/>
										</div>
										{newCustomItem.unit !== 'each' && (
											<div className='space-y-2'>
												<Label htmlFor='item-measurement'>Measurement ({newCustomItem.unit})</Label>
												<Input
													id='item-measurement'
													type='number'
													placeholder='1.00'
													min='0'
													step='0.01'
													value={newCustomItem.measurement || ''}
													onChange={e =>
														setNewCustomItem({
															...newCustomItem,
															measurement: Number.parseFloat(e.target.value) || 1,
														})
													}
												/>
											</div>
										)}
									</div>
								</div>

								<div className='flex justify-end gap-3 pt-2'>
									<Button variant='outline' onClick={resetNewItemForm}>
										Cancel
									</Button>
									<Button onClick={addCustomItem}>Add Item</Button>
								</div>
							</div>
						)}

						<div className='space-y-3'>
							{addOns.customItems.map(item => (
								<div key={item.id} className='border rounded-lg p-4 bg-card shadow-sm'>
									{editingItemId === item.id && editingItem ? (
										<div className='space-y-6'>
											<div className='flex items-center justify-between'>
												<h4 className='font-semibold text-lg'>Edit Item</h4>
												<div className='flex gap-2'>
													<Button variant='ghost' size='sm' onClick={saveEditingItem}>
														<Check className='h-4 w-4' />
													</Button>
													<Button variant='ghost' size='sm' onClick={cancelEditingItem}>
														<X className='h-4 w-4' />
													</Button>
												</div>
											</div>

											<div className='space-y-4'>
												<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
													<div className='space-y-2'>
														<Label>Item Name</Label>
														<Input
															value={editingItem.name}
															onChange={e =>
																setEditingItem({
																	...editingItem,
																	name: e.target.value,
																})
															}
														/>
													</div>
													<div className='space-y-2'>
														<Label>Price per Unit</Label>
														<Input
															type='number'
															min='0'
															step='0.01'
															value={editingItem.price}
															onChange={e =>
																setEditingItem({
																	...editingItem,
																	price: Number.parseFloat(e.target.value) || 0,
																})
															}
														/>
													</div>
												</div>

												<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
													<div className='space-y-2'>
														<Label>Unit</Label>
														<Select
															value={editingItem.unit}
															onValueChange={value => setEditingItem({ ...editingItem, unit: value })}
														>
															<SelectTrigger className='w-full'>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{unitOptions.map(unit => (
																	<SelectItem key={unit} value={unit}>
																		{unit}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div className='space-y-2'>
														<Label>Quantity</Label>
														<Input
															type='number'
															min='1'
															value={editingItem.quantity}
															onChange={e =>
																setEditingItem({
																	...editingItem,
																	quantity: Number.parseInt(e.target.value) || 1,
																})
															}
														/>
													</div>
													{editingItem.unit !== 'each' && (
														<div className='space-y-2'>
															<Label>Measurement ({editingItem.unit})</Label>
															<Input
																type='number'
																min='0'
																step='0.01'
																value={editingItem.measurement || ''}
																onChange={e =>
																	setEditingItem({
																		...editingItem,
																		measurement: Number.parseFloat(e.target.value) || 1,
																	})
																}
															/>
														</div>
													)}
												</div>
											</div>
										</div>
									) : (
										<div className='flex items-center justify-between'>
											<div className='flex-1'>
												<div className='font-medium text-lg'>{item.name}</div>
												<div className='text-sm text-muted-foreground mt-1'>
													${item.price} per {item.unit} × {item.quantity}
													{item.measurement && item.unit !== 'each' && ` × ${item.measurement}`} =
													<span className='font-medium ml-1'>
														${(item.price * item.quantity * (item.measurement || 1)).toFixed(2)}
													</span>
												</div>
											</div>
											<div className='flex gap-2'>
												<Button variant='ghost' size='sm' onClick={() => startEditingItem(item)}>
													<Edit3 className='h-4 w-4' />
												</Button>
												<Button variant='ghost' size='sm' onClick={() => removeCustomItem(item.id)}>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</div>
									)}
								</div>
							))}
						</div>

						{addOns.customItems.length === 0 && !showAddItemForm && (
							<div className='text-center py-8 text-muted-foreground'>
								<p>No custom items added yet.</p>
								<Button variant='outline' onClick={() => setShowAddItemForm(true)} className='mt-2'>
									<Plus className='h-4 w-4 mr-2' />
									Add Your First Item
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Custom Services Section */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>Custom Services</CardTitle>
						{!showAddServiceForm && (
							<Button onClick={() => setShowAddServiceForm(true)} size='sm'>
								<Plus className='h-4 w-4 mr-2' />
								Add Service
							</Button>
						)}
					</CardHeader>
					<CardContent className='space-y-4'>
						{showAddServiceForm && (
							<div className='border rounded-lg p-6 bg-secondary/50 space-y-6'>
								<div className='flex items-center justify-between'>
									<h4 className='font-semibold text-lg'>Add New Custom Service</h4>
									<Button variant='ghost' size='sm' onClick={resetNewServiceForm}>
										<X className='h-4 w-4' />
									</Button>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='service-name'>Service Name</Label>
										<Input
											id='service-name'
											placeholder='Enter service name'
											value={newCustomService.name}
											onChange={e =>
												setNewCustomService({
													...newCustomService,
													name: e.target.value,
												})
											}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='service-price'>Price</Label>
										<Input
											id='service-price'
											type='number'
											placeholder='0.00'
											min='0'
											step='0.01'
											value={newCustomService.price || ''}
											onChange={e =>
												setNewCustomService({
													...newCustomService,
													price: Number.parseFloat(e.target.value) || 0,
												})
											}
										/>
									</div>
								</div>

								<div className='flex justify-end gap-3 pt-2'>
									<Button variant='outline' onClick={resetNewServiceForm}>
										Cancel
									</Button>
									<Button onClick={addCustomService}>Add Service</Button>
								</div>
							</div>
						)}

						<div className='space-y-3'>
							{addOns.customServices.map(service => (
								<div key={service.id} className='border rounded-lg p-4 bg-card shadow-sm'>
									{editingServiceId === service.id && editingService ? (
										<div className='space-y-6'>
											<div className='flex items-center justify-between'>
												<h4 className='font-semibold text-lg'>Edit Service</h4>
												<div className='flex gap-2'>
													<Button variant='ghost' size='sm' onClick={saveEditingService}>
														<Check className='h-4 w-4' />
													</Button>
													<Button variant='ghost' size='sm' onClick={cancelEditingService}>
														<X className='h-4 w-4' />
													</Button>
												</div>
											</div>

											<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label>Service Name</Label>
													<Input
														value={editingService.name}
														onChange={e =>
															setEditingService({
																...editingService,
																name: e.target.value,
															})
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label>Price</Label>
													<Input
														type='number'
														min='0'
														step='0.01'
														value={editingService.price}
														onChange={e =>
															setEditingService({
																...editingService,
																price: Number.parseFloat(e.target.value) || 0,
															})
														}
													/>
												</div>
											</div>
										</div>
									) : (
										<div className='flex items-center justify-between'>
											<div className='flex-1'>
												<div className='font-medium text-lg'>{service.name}</div>
												<div className='text-sm text-muted-foreground mt-1'>
													<span className='font-medium'>${service.price.toFixed(2)}</span>
												</div>
											</div>
											<div className='flex gap-2'>
												<Button variant='ghost' size='sm' onClick={() => startEditingService(service)}>
													<Edit3 className='h-4 w-4' />
												</Button>
												<Button variant='ghost' size='sm' onClick={() => removeCustomService(service.id)}>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</div>
									)}
								</div>
							))}
						</div>

						{addOns.customServices.length === 0 && !showAddServiceForm && (
							<div className='text-center py-8 text-muted-foreground'>
								<p>No custom services added yet.</p>
								<Button variant='outline' onClick={() => setShowAddServiceForm(true)} className='mt-2'>
									<Plus className='h-4 w-4 mr-2' />
									Add Your First Service
								</Button>
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
