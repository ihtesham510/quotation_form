import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
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

interface HeightWidthInputs {
	height: number
	width: number
}

interface SizeValidationError {
	message: string
	isError: boolean
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

	// State for height/width inputs and validation
	const [heightWidthInputs, setHeightWidthInputs] = useState<Record<string, HeightWidthInputs>>({})
	const [sizeValidationErrors, setSizeValidationErrors] = useState<Record<string, SizeValidationError>>({})

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
		label: `Item ${selections.materialItems.length + 1}`,
		material: undefined,
		style: undefined,
		size: undefined,
		finish: undefined,
		unit_value: 0,
	})

	const [newItem, setNewItem] = useState<MaterialItem>(createEmptyMaterialItem())

	// Validate height/width dimensions against available sizes
	const validateHeightWidthSize = (height: number, width: number, availableSizes: Size[]): SizeValidationError => {
		if (!height || !width) {
			return { message: 'Please enter both height and width', isError: true }
		}

		if (height <= 0 || width <= 0) {
			return { message: 'Height and width must be greater than 0', isError: true }
		}

		const matchingSize = availableSizes.find(
			size => size.size.type === 'height_width' && size.size.height === height && size.size.width === width,
		)

		if (!matchingSize) {
			return {
				message: `No size available for ${height} x ${width}. Please check available sizes.`,
				isError: true,
			}
		}

		return { message: `Size found: ${matchingSize.name}`, isError: false }
	}

	// Handle height/width input changes
	const handleHeightWidthChange = (itemId: string, field: 'height' | 'width', value: number) => {
		const currentInputs = heightWidthInputs[itemId] || { height: 0, width: 0 }
		const updatedInputs = { ...currentInputs, [field]: value }

		setHeightWidthInputs(prev => ({
			...prev,
			[itemId]: updatedInputs,
		}))

		// Get current item to check material
		const currentItem = itemId === newItem.id ? newItem : editingItem
		if (currentItem?.material) {
			const availableSizes = getAvailableSizes(currentItem.material)
			const validation = validateHeightWidthSize(updatedInputs.height, updatedInputs.width, availableSizes)

			setSizeValidationErrors(prev => ({
				...prev,
				[itemId]: validation,
			}))

			// If validation passes, find and set the matching size
			if (!validation.isError) {
				const matchingSize = availableSizes.find(
					size =>
						size.size.type === 'height_width' &&
						size.size.height === updatedInputs.height &&
						size.size.width === updatedInputs.width,
				)

				if (matchingSize) {
					// Calculate unit_value (area = height * width)
					const area = updatedInputs.height * updatedInputs.width

					if (itemId === newItem.id) {
						setNewItem(prev => ({
							...prev,
							size: matchingSize,
							unit_value: area,
						}))
					} else if (editingItem) {
						setEditingItem(prev =>
							prev
								? {
										...prev,
										size: matchingSize,
										unit_value: area,
									}
								: null,
						)
					}
				}
			}
		}
	}

	// Reset height/width inputs when size changes or material changes
	const resetHeightWidthInputs = (itemId: string) => {
		setHeightWidthInputs(prev => ({
			...prev,
			[itemId]: { height: 0, width: 0 },
		}))
		setSizeValidationErrors(prev => ({
			...prev,
			[itemId]: { message: '', isError: false },
		}))
	}

	const handleAddItem = () => {
		const updatedSelections = {
			...selections,
			materialItems: [...selections.materialItems, newItem],
		}
		onSelectionsChange(updatedSelections)
		setNewItem(createEmptyMaterialItem())
		setShowAddForm(false)
		// Clean up height/width state
		resetHeightWidthInputs(newItem.id)
	}

	const handleEditItem = (itemId: string, updatedItem: MaterialItem) => {
		const updatedSelections = {
			...selections,
			materialItems: selections.materialItems.map(item => (item.id === itemId ? updatedItem : item)),
		}
		onSelectionsChange(updatedSelections)
		setEditingItemId(null)
		setEditingItem(null)
		// Clean up height/width state
		resetHeightWidthInputs(itemId)
	}

	const handleRemoveItem = (itemId: string) => {
		const updatedSelections = {
			...selections,
			materialItems: selections.materialItems.filter(item => item.id !== itemId),
		}
		onSelectionsChange(updatedSelections)
		// Clean up height/width state
		resetHeightWidthInputs(itemId)
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

	const renderSizeSelection = (item: MaterialItem, onItemChange: (updatedItem: MaterialItem) => void) => {
		const availableSizes = getAvailableSizes(item.material)
		const heightWidthSizes = availableSizes.filter(size => size.size.type === 'height_width')

		return (
			<div className='space-y-2'>
				<Label>Size *</Label>

				{/* Regular size selection for non-height_width sizes */}
				{availableSizes.length > 0 && (
					<Popover open={isPopoverOpen(item.id, 'size')} onOpenChange={() => togglePopover(item.id, 'size')}>
						<PopoverTrigger asChild>
							<Button variant='outline' role='combobox' className='w-full justify-between' disabled={!item.material}>
								{item.size && item.size.size.type !== 'height_width' ? item.size.name : 'Select size...'}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0'>
							<Command>
								<CommandInput placeholder='Search sizes...' />
								<CommandList>
									<CommandEmpty>No size found.</CommandEmpty>
									<CommandGroup>
										{availableSizes.map(size => (
											<CommandItem
												key={size._id}
												value={size.name}
												onSelect={() => {
													onItemChange({ ...item, size })
													togglePopover(item.id, 'size')
													resetHeightWidthInputs(item.id)
												}}
											>
												<Check
													className={cn('mr-2 h-4 w-4', item.size?._id === size._id ? 'opacity-100' : 'opacity-0')}
												/>
												{size.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				)}

				{/* Height/Width input for height_width type sizes */}
				{heightWidthSizes.length > 0 && (
					<div className='space-y-3 p-3 border rounded-lg bg-muted/50'>
						<p className='text-sm font-medium'>Custom Dimensions</p>
						<div className='grid grid-cols-2 gap-2'>
							<div className='space-y-2'>
								<Label className='text-xs'>Height</Label>
								<Input
									type='number'
									min='0'
									step='0.01'
									placeholder='Height'
									value={heightWidthInputs[item.id]?.height || ''}
									onChange={e => handleHeightWidthChange(item.id, 'height', parseFloat(e.target.value) || 0)}
									disabled={!item.material}
								/>
							</div>
							<div className='space-y-2'>
								<Label className='text-xs'>Width</Label>
								<Input
									type='number'
									min='0'
									step='0.01'
									placeholder='Width'
									value={heightWidthInputs[item.id]?.width || ''}
									onChange={e => handleHeightWidthChange(item.id, 'width', parseFloat(e.target.value) || 0)}
									disabled={!item.material}
								/>
							</div>
						</div>

						{/* Validation message */}
						{sizeValidationErrors[item.id] && (
							<div
								className={cn(
									'flex items-center gap-2 text-xs p-2 rounded',
									sizeValidationErrors[item.id].isError
										? 'text-destructive bg-muted border border-destructive'
										: 'text-primary bg-muted border border-primary',
								)}
							>
								{sizeValidationErrors[item.id].isError && <AlertCircle className='h-3 w-3' />}
								{sizeValidationErrors[item.id].message}
							</div>
						)}
					</div>
				)}

				{/* Show selected size info */}
				{item.size && (
					<div className='text-xs text-muted-foreground p-2 bg-muted rounded'>
						Selected: {item.size.name}
						{item.size.size.type === 'height_width' && (
							<span>
								{' '}
								({item.size.size.height} x {item.size.size.width})
							</span>
						)}
					</div>
				)}
			</div>
		)
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
													resetHeightWidthInputs(item.id)
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
							<Button variant='outline' role='combobox' className='w-full justify-between' disabled={!item.material}>
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
			</div>

			{/* Size Selection - Updated */}
			<div className='grid grid-cols-1 gap-4'>{renderSizeSelection(item, onItemChange)}</div>

			{/* Finish Selection */}
			<div className='space-y-2'>
				<Label>Finish *</Label>
				<Popover open={isPopoverOpen(item.id, 'finish')} onOpenChange={() => togglePopover(item.id, 'finish')}>
					<PopoverTrigger asChild>
						<Button variant='outline' role='combobox' className='w-full justify-between' disabled={!item.material}>
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

			{/* Unit Value Input */}
			{!sizeValidationErrors[item.id]?.isError && (
				<div className='space-y-4'>
					{/* For height_width type sizes, show two input options */}
					{item.size?.size.type === 'height_width' ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Quantity Input */}
							<div className='space-y-2'>
								<Label>Quantity (Number of Tiles)</Label>
								<Input
									type='number'
									min='0'
									step='1'
									value={Math.ceil(item.unit_value) || ''}
									onChange={e =>
										onItemChange({
											...item,
											unit_value: parseInt(e.target.value) || 0,
										})
									}
									placeholder='Enter quantity...'
								/>
							</div>

							{/* Square Meter Input with Auto-calculation */}
							<div className='space-y-2'>
								<Label>Area (Square Meters)</Label>
								<Input
									type='number'
									min='0'
									step='0.01'
									placeholder='Enter area in m²...'
									onChange={e => {
										const area = parseFloat(e.target.value) || 0
										if (area > 0 && item.size?.size.type === 'height_width') {
											const tileArea = item.size.size.height * item.size.size.width
											const requiredTiles = Math.ceil(area / tileArea)
											onItemChange({
												...item,
												unit_value: requiredTiles,
											})
										}
									}}
								/>
								{item.size && item.size.size.type === 'height_width' && (
									<p className='text-xs text-muted-foreground'>
										Tile size: {item.size.size.height} × {item.size.size.width} m² (
										{Math.ceil(item.size.size.height * item.size.size.width)} m² per tile)
									</p>
								)}
							</div>
						</div>
					) : (
						/* For other size types, show single input */
						<div className='space-y-2'>
							{item.size?.size.type === 'linear_meter' && <Label>Linear Meter</Label>}
							{!item.size && <Label>Unit Value</Label>}
							<Input
								type='number'
								min='0'
								step='0.01'
								value={item.unit_value || ''}
								onChange={e =>
									onItemChange({
										...item,
										unit_value: parseFloat(e.target.value) || 0,
									})
								}
								placeholder='Enter value...'
							/>
						</div>
					)}
				</div>
			)}

			{/* Action Buttons */}
			<div className='flex justify-end gap-2'>
				{isEditing ? (
					<>
						<Button
							variant='outline'
							onClick={() => {
								setEditingItemId(null)
								setEditingItem(null)
								resetHeightWidthInputs(item.id)
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => handleEditItem(item.id, item)}
							disabled={
								!item.label ||
								!item.material ||
								!item.style ||
								!item.size ||
								!item.finish ||
								!item.unit_value ||
								sizeValidationErrors[item.id]?.isError
							}
						>
							Save Changes
						</Button>
					</>
				) : (
					<>
						<Button
							variant='outline'
							onClick={() => {
								setShowAddForm(false)
								resetHeightWidthInputs(item.id)
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddItem}
							disabled={
								!item.label ||
								!item.material ||
								!item.style ||
								!item.size ||
								!item.finish ||
								!item.unit_value ||
								sizeValidationErrors[item.id]?.isError
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
															{item.size?.size.type === 'height_width' && (
																<span className='text-muted-foreground'>
																	{' '}
																	({item.size.size.height} x {item.size.size.width})
																</span>
															)}
														</div>
														<div>
															<span className='font-medium'>Finish:</span> {item.finish?.name || 'Not selected'}
														</div>
														<div className='col-span-2'>
															<span className='font-medium'>
																{item.size?.size.type === 'linear_meter'
																	? 'Linear Meters:'
																	: item.size?.size.type === 'height_width'
																		? 'Quantity (Tiles):'
																		: 'Unit Value:'}
															</span>{' '}
															{item.unit_value}
															{item.size?.size.type === 'linear_meter'
																? ' m'
																: item.size?.size.type === 'height_width'
																	? ' tiles'
																	: ''}
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
