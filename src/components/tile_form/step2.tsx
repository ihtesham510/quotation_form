import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PricingSummary } from './pricing-summary'
import type { Material, Style, Size, Finish, Selections, CalculationResult, MaterialItem } from './types'

interface Step2Props {
	materials: Material[]
	styles: Style[]
	sizes: Size[]
	finishes: Finish[]
	selections: Selections
	onSelectionsChange: (selections: Selections) => void
	onNext: () => void
	onPrevious: () => void
	pricing: CalculationResult
	isValid: boolean
	errors: Record<string, string>
}

export function Step2({
	materials,
	styles,
	sizes,
	finishes,
	selections,
	onSelectionsChange,
	onNext,
	onPrevious,
	pricing,
	isValid,
}: Step2Props) {
	const [showAddForm, setShowAddForm] = useState(false)
	const [editingItemId, setEditingItemId] = useState<string | null>(null)
	const [editingItem, setEditingItem] = useState<MaterialItem | null>(null)
	const [openPopovers, setOpenPopovers] = useState<Record<string, Record<string, boolean>>>({})

	const getAvailableStyles = (selectedMaterial?: Material) => {
		if (!selectedMaterial) return styles
		return styles.filter(style => selectedMaterial.styleIds.includes(style._id))
	}

	const getAvailableSizes = (selectedMaterial?: Material) => {
		if (!selectedMaterial) return sizes
		return sizes.filter(size => selectedMaterial.sizeIds.includes(size._id))
	}

	const getAvailableFinishes = (selectedMaterial?: Material) => {
		if (!selectedMaterial) return finishes
		return finishes.filter(finish => selectedMaterial.finishIds.includes(finish._id))
	}

	const createEmptyMaterialItem = (): MaterialItem => ({
		id: Date.now().toString(),
		label: `Item ${selections.materialItems.length + 1}`, // Auto-generate default label
		material: undefined,
		style: undefined,
		size: undefined,
		finish: undefined,
		squareFootage: 0,
	})

	const [newItem, setNewItem] = useState<MaterialItem>(createEmptyMaterialItem())

	const handleAddItem = () => {
		const updatedSelections = {
			...selections,
			materialItems: [...selections.materialItems, newItem],
		}
		onSelectionsChange(updatedSelections)
		setNewItem(createEmptyMaterialItem())
		setShowAddForm(false)
	}

	const handleEditItem = (itemId: string, updatedItem: MaterialItem) => {
		const updatedSelections = {
			...selections,
			materialItems: selections.materialItems.map(item => (item.id === itemId ? updatedItem : item)),
		}
		onSelectionsChange(updatedSelections)
		setEditingItemId(null)
		setEditingItem(null)
	}

	const handleRemoveItem = (itemId: string) => {
		const updatedSelections = {
			...selections,
			materialItems: selections.materialItems.filter(item => item.id !== itemId),
		}
		onSelectionsChange(updatedSelections)
	}

	const togglePopover = (itemId: string, field: string) => {
		setOpenPopovers(prev => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				[field]: !prev[itemId]?.[field],
			},
		}))
	}

	const isPopoverOpen = (itemId: string, field: string) => {
		return openPopovers[itemId]?.[field] || false
	}

	const renderMaterialItemForm = (
		item: MaterialItem,
		onItemChange: (updatedItem: MaterialItem) => void,
		isEditing = false,
	) => (
		<div className='space-y-4 p-4 bg-card border rounded-lg'>
			<div className='space-y-2'>
				<Label>Item Label *</Label>
				<Input
					type='text'
					value={item.label}
					onChange={e => onItemChange({ ...item, label: e.target.value })}
					placeholder='Enter item label...'
				/>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{/* Material Selection */}
				<div className='space-y-2'>
					<Label>Material *</Label>
					<Popover open={isPopoverOpen(item.id, 'material')} onOpenChange={() => togglePopover(item.id, 'material')}>
						<PopoverTrigger asChild>
							<Button variant='outline' role='combobox' className='w-full justify-between'>
								{item.material ? item.material.name : 'Select material...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search materials...' />
								<CommandList>
									<CommandEmpty>No material found.</CommandEmpty>
									<CommandGroup>
										{materials.map(material => (
											<CommandItem
												key={material._id}
												value={material.name}
												onSelect={() => {
													onItemChange({
														...item,
														material,
														style: undefined,
														size: undefined,
														finish: undefined,
													})
													togglePopover(item.id, 'material')
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														item.material?._id === material._id ? 'opacity-100' : 'opacity-0',
													)}
												/>
												{material.name} (${material.basePrice}/sq ft)
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{/* Style Selection */}
				<div className='space-y-2'>
					<Label>Style *</Label>
					<Popover open={isPopoverOpen(item.id, 'style')} onOpenChange={() => togglePopover(item.id, 'style')}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								className='w-full justify-between'
								disabled={!item.material} // Disable if no material selected
							>
								{item.style ? item.style.name : 'Select style...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search styles...' />
								<CommandList>
									<CommandEmpty>No style found.</CommandEmpty>
									<CommandGroup>
										{getAvailableStyles(item.material).map(style => (
											<CommandItem
												key={style._id}
												value={style.name}
												onSelect={() => {
													onItemChange({ ...item, style })
													togglePopover(item.id, 'style')
												}}
											>
												<Check
													className={cn('mr-2 h-4 w-4', item.style?._id === style._id ? 'opacity-100' : 'opacity-0')}
												/>
												{style.name} ({style.multiplier}x)
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{/* Size Selection */}
				<div className='space-y-2'>
					<Label>Size *</Label>
					<Popover open={isPopoverOpen(item.id, 'size')} onOpenChange={() => togglePopover(item.id, 'size')}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								className='w-full justify-between'
								disabled={!item.material} // Disable if no material selected
							>
								{item.size ? item.size.name : 'Select size...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search sizes...' />
								<CommandList>
									<CommandEmpty>No size found.</CommandEmpty>
									<CommandGroup>
										{getAvailableSizes(item.material).map(size => (
											<CommandItem
												key={size._id}
												value={size.name}
												onSelect={() => {
													onItemChange({ ...item, size })
													togglePopover(item.id, 'size')
												}}
											>
												<Check
													className={cn('mr-2 h-4 w-4', item.size?._id === size._id ? 'opacity-100' : 'opacity-0')}
												/>
												{size.name} ({size.multiplier}x)
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{/* Finish Selection */}
				<div className='space-y-2'>
					<Label>Finish *</Label>
					<Popover open={isPopoverOpen(item.id, 'finish')} onOpenChange={() => togglePopover(item.id, 'finish')}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								className='w-full justify-between'
								disabled={!item.material} // Disable if no material selected
							>
								{item.finish ? item.finish.name : 'Select finish...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search finishes...' />
								<CommandList>
									<CommandEmpty>No finish found.</CommandEmpty>
									<CommandGroup>
										{getAvailableFinishes(item.material).map(finish => (
											<CommandItem
												key={finish._id}
												value={finish.name}
												onSelect={() => {
													onItemChange({ ...item, finish })
													togglePopover(item.id, 'finish')
												}}
											>
												<Check
													className={cn('mr-2 h-4 w-4', item.finish?._id === finish._id ? 'opacity-100' : 'opacity-0')}
												/>
												{finish.name} (+${finish.premium}/sq ft)
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Square Footage */}
			<div className='space-y-2'>
				<Label>Square Footage *</Label>
				<Input
					type='number'
					min='0'
					step='0.01'
					value={item.squareFootage || ''}
					onChange={e =>
						onItemChange({
							...item,
							squareFootage: Number.parseFloat(e.target.value) || 0,
						})
					}
				/>
			</div>

			{/* Action Buttons */}
			<div className='flex justify-end gap-2'>
				{isEditing ? (
					<>
						<Button
							variant='outline'
							onClick={() => {
								setEditingItemId(null)
								setEditingItem(null)
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => handleEditItem(item.id, item)}
							disabled={
								!item.label || !item.material || !item.style || !item.size || !item.finish || !item.squareFootage
							}
						>
							Save Changes
						</Button>
					</>
				) : (
					<>
						<Button variant='outline' onClick={() => setShowAddForm(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleAddItem}
							disabled={
								!item.label || !item.material || !item.style || !item.size || !item.finish || !item.squareFootage
							}
						>
							Add Item
						</Button>
					</>
				)}
			</div>
		</div>
	)

	return (
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			<div className='lg:col-span-2'>
				<Card>
					<CardHeader>
						<CardTitle>Material Selection</CardTitle>
					</CardHeader>
					<CardContent className='space-y-6'>
						{selections.materialItems.length > 0 && (
							<div className='space-y-4'>
								<h3 className='text-lg font-medium'>Selected Materials</h3>
								{selections.materialItems.map(item => (
									<div key={item.id} className='border rounded-lg p-4'>
										{editingItemId === item.id ? (
											renderMaterialItemForm(editingItem!, setEditingItem, true)
										) : (
											<div className='flex justify-between items-start'>
												<div className='space-y-2'>
													<h4 className='font-medium'>{item.label}</h4>
													<div className='grid grid-cols-2 gap-4 text-sm'>
														<div>
															<span className='font-medium'>Material:</span> {item.material?.name || 'Not selected'}
														</div>
														<div>
															<span className='font-medium'>Style:</span> {item.style?.name || 'Not selected'}
														</div>
														<div>
															<span className='font-medium'>Size:</span> {item.size?.name || 'Not selected'}
														</div>
														<div>
															<span className='font-medium'>Finish:</span> {item.finish?.name || 'Not selected'}
														</div>
														<div className='col-span-2'>
															<span className='font-medium'>Square Footage:</span> {item.squareFootage} sq ft
														</div>
													</div>
												</div>
												<div className='flex gap-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => {
															setEditingItemId(item.id)
															setEditingItem(item)
														}}
													>
														<Edit2 className='h-4 w-4' />
													</Button>
													<Button variant='outline' size='sm' onClick={() => handleRemoveItem(item.id)}>
														<Trash2 className='h-4 w-4' />
													</Button>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						)}

						{!showAddForm && editingItemId === null && (
							<div className='text-center py-8'>
								{selections.materialItems.length === 0 ? (
									<div className='space-y-4'>
										<p className='text-muted-foreground'>No materials selected yet</p>
										<Button onClick={() => setShowAddForm(true)}>
											<Plus className='mr-2 h-4 w-4' />
											Add First Material
										</Button>
									</div>
								) : (
									<Button onClick={() => setShowAddForm(true)}>
										<Plus className='mr-2 h-4 w-4' />
										Add Another Material
									</Button>
								)}
							</div>
						)}

						{showAddForm && editingItemId === null && (
							<div className='space-y-4'>
								<h3 className='text-lg font-medium'>Add New Material</h3>
								{renderMaterialItemForm(newItem, setNewItem)}
							</div>
						)}

						<div className='flex justify-between mt-6'>
							<Button variant='outline' onClick={onPrevious}>
								Previous
							</Button>
							<Button onClick={onNext} disabled={!isValid}>
								Next
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<div>
				<PricingSummary pricing={pricing} />
			</div>
		</div>
	)
}
